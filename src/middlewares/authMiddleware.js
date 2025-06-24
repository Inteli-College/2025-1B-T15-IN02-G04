const jwt = require("jsonwebtoken");

const checkAuth = (req, res, next) => {
  const token = req.cookies.token;

  if (req.path === "/dashboard" || req.path === "/me" || req.path.startsWith("/perfil")) {
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

  if (!token) {
    return next(); 
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET);
    return res.redirect("/dashboard");
  } catch (err) {
    console.error("Erro ao verificar token:", err);
    res.clearCookie("token");
    return next();
  }
};

module.exports = checkAuth;