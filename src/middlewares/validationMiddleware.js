/**
 * Middleware de validação de dados para o dashboard modular
 * Valida diferentes tipos de entrada baseado em schemas predefinidos
 */

const db = require('../config/db');

class ValidationMiddleware {
  /**
   * Factory function para criar validators específicos
   * @param {Object} schema - Schema de validação
   * @param {Object} options - Opções de validação
   */
  static createValidator(schema, options = {}) {
    const {
      skipOnEmpty = false,
      allowExtraFields = false,
      errorOnMissing = true
    } = options;

    return (req, res, next) => {
      try {
        const dataToValidate = req.body;
        const errors = [];
        const validatedData = {};

        // Verificar campos obrigatórios
        for (const [field, rules] of Object.entries(schema)) {
          const value = dataToValidate[field];
          const fieldErrors = [];

          // Verificar se campo é obrigatório
          if (rules.required && (value === undefined || value === null || value === '')) {
            if (errorOnMissing) {
              fieldErrors.push(`${field} é obrigatório`);
            }
            continue;
          }

          // Pular validação se campo vazio e skipOnEmpty = true
          if (skipOnEmpty && (value === undefined || value === null || value === '')) {
            continue;
          }

          // Aplicar validações se valor existir
          if (value !== undefined && value !== null && value !== '') {
            const fieldValidationErrors = ValidationMiddleware.validateField(field, value, rules);
            fieldErrors.push(...fieldValidationErrors);
          }

          // Adicionar ao resultado se válido
          if (fieldErrors.length === 0) {
            validatedData[field] = ValidationMiddleware.parseValue(value, rules.type);
          } else {
            errors.push(...fieldErrors.map(error => ({ field, error })));
          }
        }

        // Verificar campos extras não permitidos
        if (!allowExtraFields) {
          const extraFields = Object.keys(dataToValidate).filter(key => !schema[key]);
          extraFields.forEach(field => {
            errors.push({ field, error: `Campo '${field}' não é permitido` });
          });
        }

        // Se há erros, retornar erro de validação
        if (errors.length > 0) {
          return res.status(400).json({
            error: 'Dados inválidos',
            validationErrors: errors
          });
        }

        // Adicionar dados validados ao request
        req.validatedData = validatedData;
        next();

      } catch (error) {
        console.error('Erro no middleware de validação:', error);
        return res.status(500).json({
          error: 'Erro interno de validação',
          details: error.message
        });
      }
    };
  }

  /**
   * Valida um campo específico
   */
  static validateField(fieldName, value, rules) {
    const errors = [];

    // Validação de tipo
    if (rules.type && !ValidationMiddleware.validateType(value, rules.type)) {
      errors.push(`${fieldName} deve ser do tipo ${rules.type}`);
      return errors; // Para se tipo estiver errado
    }

    // Validação de tamanho mínimo
    if (rules.minLength && value.length < rules.minLength) {
      errors.push(`${fieldName} deve ter pelo menos ${rules.minLength} caracteres`);
    }

    // Validação de tamanho máximo
    if (rules.maxLength && value.length > rules.maxLength) {
      errors.push(`${fieldName} deve ter no máximo ${rules.maxLength} caracteres`);
    }

    // Validação de valor mínimo (números)
    if (rules.min !== undefined && Number(value) < rules.min) {
      errors.push(`${fieldName} deve ser maior ou igual a ${rules.min}`);
    }

    // Validação de valor máximo (números)
    if (rules.max !== undefined && Number(value) > rules.max) {
      errors.push(`${fieldName} deve ser menor ou igual a ${rules.max}`);
    }

    // Validação de padrão (regex)
    if (rules.pattern && !rules.pattern.test(value)) {
      errors.push(`${fieldName} não atende ao formato exigido`);
    }

    // Validação de valores permitidos
    if (rules.enum && !rules.enum.includes(value)) {
      errors.push(`${fieldName} deve ser um dos valores: ${rules.enum.join(', ')}`);
    }

    // Validação customizada
    if (rules.customValidator) {
      const customError = rules.customValidator(value);
      if (customError) {
        errors.push(`${fieldName}: ${customError}`);
      }
    }

    return errors;
  }

  /**
   * Valida tipo de dados
   */
  static validateType(value, type) {
    switch (type) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return !isNaN(Number(value)) && isFinite(Number(value));
      case 'integer':
        return Number.isInteger(Number(value));
      case 'boolean':
        return typeof value === 'boolean' || value === 'true' || value === 'false';
      case 'email':
        return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      case 'array':
        return Array.isArray(value);
      case 'object':
        return typeof value === 'object' && value !== null && !Array.isArray(value);
      default:
        return true;
    }
  }

  /**
   * Converte valor para o tipo correto
   */
  static parseValue(value, type) {
    switch (type) {
      case 'number':
      case 'integer':
        return Number(value);
      case 'boolean':
        return value === true || value === 'true';
      default:
        return value;
    }
  }

  /**
   * Validator para criar PTD
   */
  static validateCreatePTD = ValidationMiddleware.createValidator({
    name: {
      required: true,
      type: 'string',
      minLength: 2,
      maxLength: 100
    },
    email: {
      required: true,
      type: 'email',
      maxLength: 255
    },
    username: {
      required: true,
      type: 'string',
      minLength: 3,
      maxLength: 50,
      pattern: /^[a-zA-Z0-9_-]+$/
    },
    password: {
      required: true,
      type: 'string',
      minLength: 6,
      maxLength: 100
    }
  });

  /**
   * Validator para criar Gestor/Admin
   */
  static validateCreateGestorAdmin = ValidationMiddleware.createValidator({
    name: {
      required: true,
      type: 'string',
      minLength: 2,
      maxLength: 100
    },
    email: {
      required: true,
      type: 'email',
      maxLength: 255
    },
    username: {
      required: true,
      type: 'string',
      minLength: 3,
      maxLength: 50,
      pattern: /^[a-zA-Z0-9_-]+$/
    },
    password: {
      required: true,
      type: 'string',
      minLength: 8,
      maxLength: 100
    },
    id_role: {
      required: true,
      type: 'integer',
      enum: [1, 2]
    }
  });

  /**
   * Validator para atribuir trilha
   */
  static validateAssignTrail = ValidationMiddleware.createValidator({
    ptdId: {
      required: true,
      type: 'integer',
      min: 1
    },
    trailId: {
      required: true,
      type: 'integer',
      min: 1
    },
    permissions: {
      required: false,
      type: 'string',
      maxLength: 500
    }
  });

  /**
   * Validator para atualizar score
   */
  static validateUpdateScore = ValidationMiddleware.createValidator({
    newScore: {
      required: true,
      type: 'integer',
      min: 0,
      max: 999999
    },
    reason: {
      required: false,
      type: 'string',
      maxLength: 255
    }
  });

  /**
   * Validator para IDs em parâmetros de URL
   */
  static validateIdParam(paramName = 'id') {
    return (req, res, next) => {
      const id = req.params[paramName];
      
      if (!id) {
        return res.status(400).json({
          error: `Parâmetro ${paramName} é obrigatório`
        });
      }
      
      if (isNaN(id) || parseInt(id) <= 0) {
        return res.status(400).json({
          error: `Parâmetro ${paramName} deve ser um número inteiro positivo`
        });
      }
      
      req.params[paramName] = parseInt(id);
      next();
    };
  }

  /**
   * Validator para paginação
   */
  static validatePagination = (req, res, next) => {
    const { page = 1, limit = 20 } = req.query;
    
    const parsedPage = parseInt(page);
    const parsedLimit = parseInt(limit);
    
    if (isNaN(parsedPage) || parsedPage < 1) {
      return res.status(400).json({
        error: 'Página deve ser um número inteiro positivo'
      });
    }
    
    if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) {
      return res.status(400).json({
        error: 'Limite deve ser um número entre 1 e 100'
      });
    }
    
    req.pagination = {
      page: parsedPage,
      limit: parsedLimit,
      offset: (parsedPage - 1) * parsedLimit
    };
    
    next();
  };

  /**
   * Validator para busca/filtros
   */
  static validateSearchFilters = (req, res, next) => {
    const { search, role, sortBy, sortOrder } = req.query;
    
    const filters = {};
    
    // Validar busca
    if (search) {
      if (typeof search !== 'string' || search.length > 100) {
        return res.status(400).json({
          error: 'Termo de busca deve ser uma string de até 100 caracteres'
        });
      }
      filters.search = search.trim();
    }
    
    // Validar role
    if (role) {
      const roleNum = parseInt(role);
      if (isNaN(roleNum) || ![1, 2, 3].includes(roleNum)) {
        return res.status(400).json({
          error: 'Role deve ser 1 (Admin), 2 (Gestor) ou 3 (PTD)'
        });
      }
      filters.role = roleNum;
    }
    
    // Validar ordenação
    if (sortBy) {
      const allowedSortFields = ['name', 'email', 'score', 'created_at'];
      if (!allowedSortFields.includes(sortBy)) {
        return res.status(400).json({
          error: `Campo de ordenação deve ser um de: ${allowedSortFields.join(', ')}`
        });
      }
      filters.sortBy = sortBy;
    }
    
    if (sortOrder) {
      if (!['asc', 'desc'].includes(sortOrder.toLowerCase())) {
        return res.status(400).json({
          error: 'Ordem deve ser "asc" ou "desc"'
        });
      }
      filters.sortOrder = sortOrder.toLowerCase();
    }
    
    req.filters = filters;
    next();
  };

  /**
   * Validator assíncrono para verificar existência no banco
   */
  static validateExists(table, field = 'id', paramName = 'id') {
    return async (req, res, next) => {
      try {
        const value = req.params[paramName] || req.body[paramName];
        
        if (!value) {
          return res.status(400).json({
            error: `${paramName} é obrigatório`
          });
        }
        
        const result = await db.query(
          `SELECT id FROM ${table} WHERE ${field} = $1`,
          [value]
        );
        
        if (result.rows.length === 0) {
          return res.status(404).json({
            error: `${table} não encontrado(a)`
          });
        }
        
        next();
        
      } catch (error) {
        console.error(`Erro ao validar existência em ${table}:`, error);
        return res.status(500).json({
          error: 'Erro interno de validação'
        });
      }
    };
  }

  /**
   * Validator para verificar unicidade
   */
  static validateUnique(table, field, message = null) {
    return async (req, res, next) => {
      try {
        const value = req.body[field];
        
        if (!value) {
          return next(); // Se não há valor, deixar outros validators tratarem
        }
        
        const result = await db.query(
          `SELECT id FROM ${table} WHERE ${field} = $1`,
          [value]
        );
        
        if (result.rows.length > 0) {
          return res.status(409).json({
            error: message || `${field} já está em uso`,
            field
          });
        }
        
        next();
        
      } catch (error) {
        console.error(`Erro ao validar unicidade de ${field}:`, error);
        return res.status(500).json({
          error: 'Erro interno de validação'
        });
      }
    };
  }

  /**
   * Sanitizer para limpar dados de entrada
   */
  static sanitizeInput = (req, res, next) => {
    const sanitizeString = (str) => {
      if (typeof str !== 'string') return str;
      
      return str
        .trim()
        .replace(/[<>]/g, '') // Remove < e >
        .replace(/javascript:/gi, '') // Remove javascript:
        .replace(/on\w+=/gi, ''); // Remove atributos de evento
    };
    
    const sanitizeObject = (obj) => {
      if (typeof obj !== 'object' || obj === null) return obj;
      
      if (Array.isArray(obj)) {
        return obj.map(sanitizeObject);
      }
      
      const sanitized = {};
      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
          sanitized[key] = sanitizeString(value);
        } else if (typeof value === 'object') {
          sanitized[key] = sanitizeObject(value);
        } else {
          sanitized[key] = value;
        }
      }
      return sanitized;
    };
    
    req.body = sanitizeObject(req.body);
    req.query = sanitizeObject(req.query);
    
    next();
  };
}

module.exports = ValidationMiddleware;