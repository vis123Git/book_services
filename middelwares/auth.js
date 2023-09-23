const jwt = require("jsonwebtoken");

const verifyAdminToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) return res.status(401).json({ message: "Token not provided" });

  const tokenParts = authHeader.split(" ");
  if (tokenParts.length !== 2 || tokenParts[0] !== "Bearer") return res.status(401).json({ message: "Invalid token format" });

  const token = tokenParts[1];

  // Verify the token
  jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
    if (err) return res.status(401).json({ message: "Invalid token" });

    if (!decoded.isAdmin) return res.status(403).json({ message: "Permission denied" });

    req.admin_id = decoded.admin_id;
    req.isAdmin = decoded.isAdmin;
    next();
  });
};

module.exports = verifyAdminToken;
