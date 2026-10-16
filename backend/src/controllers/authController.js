const authService = require("../services/authService");

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/api/v1/auth",
};

const refreshCookieOptions = {
  ...cookieOptions,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const sendSession = (res, session, statusCode = 200) => {
  res.cookie("accessToken", session.accessToken, {
    ...cookieOptions,
    path: "/",
    maxAge: 15 * 60 * 1000,
  });

  res.cookie("refreshToken", session.refreshToken, refreshCookieOptions);

  return res.status(statusCode).json({
    success: true,
    message: "Authentication successful",
    data: {
      user: session.user,
    },
  });
};

const login = async (req, res, next) => {
  try {
    const session = await authService.login(req.body);
    return sendSession(res, session);
  } catch (error) {
    next(error);
  }
};

const refresh = async (req, res, next) => {
  try {
    const session = await authService.refreshSession(req.cookies.refreshToken);

    return sendSession(res, session);
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    await authService.logout(req.cookies.refreshToken);

    res.clearCookie("accessToken", {
      ...cookieOptions,
      path: "/",
    });

    res.clearCookie("refreshToken", refreshCookieOptions);

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { login, refresh, logout };
