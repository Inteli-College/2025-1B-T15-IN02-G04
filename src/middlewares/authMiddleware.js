const jwt = require("jsonwebtoken");

const checkAuth = (req, res, next) => {
  const token = req.cookies.token;

  if (
    req.path === "/dashboard" ||
    req.path === "/me" ||
    req.path.startsWith("/perfil") ||
    req.path.startsWith("/feed") ||
    req.path.startsWith("/cards")
  ) {
    if (!token) {
      console.log("No token found, redirecting to /login");
      return res.redirect("/login");
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.userId = decoded.id;
      return next();
    } catch (err) {
      console.error("Erro ao verificar token:", err);
      res.clearCookie("token");
      return res.redirect("/login");
    }
  }

  // Para outras rotas, verificar se há token válido e definir userId se houver
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.userId = decoded.id;
    } catch (err) {
      console.error("Token inválido:", err);
      res.clearCookie("token");
    }
  }

  // Para login, redirecionar para dashboard se já estiver logado
  if (req.path === "/login" && token) {
    try {
      jwt.verify(token, process.env.JWT_SECRET);
      return res.redirect("/dashboard");
    } catch (err) {
      console.error("Erro ao verificar token:", err);
      res.clearCookie("token");
    }
  }

  return next();
};

module.exports = checkAuth;
