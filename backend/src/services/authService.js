const User = require("../models/User");
const { comparePassword } = require("../utils/password");

const {
  generateAccessToken,
  generateRefreshToken,
  hashRefreshToken,
} = require("../utils/token");

const AppError = require("../utils/AppError");
const RefreshToken = require("../models/RefreshToken");

const createSession = async (user) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  await RefreshToken.create({
    user: user._id,
    tokenHash: hashRefreshToken(refreshToken),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  return { accessToken, refreshToken };
};

const login = async ({ email, password }) => {
  //   if (typeof email !== "string" || typeof password !== "string") {
  //     throw new AppError("Email and password are required", 400);
  //   }
  const user = await User.findOne({
    email: email.trim().toLowerCase(),
    isActive: true,
  }).select("+password");

  if (!user || !(await comparePassword(password, user.password))) {
    throw new AppError("Invalid email or password", 401);
  }
  const tokens = await createSession(user);

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
    },
    ...tokens,
  };
};

const refreshSession = async (rawToken) => {
  if (!rawToken) {
    throw new AppError("Refresh token is required", 401);
  }
  const tokenHash = hashRefreshToken(rawToken);
  const storedToken = await RefreshToken.findOne({
    tokenHash,
    revokedAt: null,
    expiresAt: { $gt: new Date() },
  }).select("+tokenHash");

  if (!storedToken) {
    throw new AppError("Invalid or expired refresh token", 401);
  }
  const user = await User.findOne({
    _id: storedToken.user,
    isActive: true,
  });

  if (!user) {
    throw new AppError("Invalid or inactive user", 401);
  }
  // Rotate the refresh token: invalidate the old one.
  storedToken.revokedAt = new Date();
  await storedToken.save();

  const tokens = await createSession(user);
  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
    },
    ...tokens,
  };
};

const logout = async (rawToken) => {
  if (!rawToken) return;

  await RefreshToken.updateOne(
    {
      tokenHash: hashRefreshToken(rawToken),
      revokedAt: null,
    },
    {
      $set: { revokedAt: new Date() },
    },
  );
};

module.exports = {
  login,
  refreshSession,
  logout,
};
