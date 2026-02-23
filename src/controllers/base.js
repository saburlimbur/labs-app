class BaseController {
  sendSuccess(res, data, message = "Success", statusCode = 200) {
    return res.status(statusCode).json({
      status: "success",
      message: message,
      data: data,
    });
  }

  sendError(res, message = "Internal server error", statusCode = 500) {
    return res.status(statusCode).json({
      status: "error",
      message: message,
    });
  }
}

module.exports = BaseController;
