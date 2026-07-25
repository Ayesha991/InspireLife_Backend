/**
 * Standardized API response helpers
 * Every API response follows: { success, message, data }
 */

exports.success = (res, statusCode, message, data = null) => {
  const response = { success: true, message };
  if (data !== null) response.data = data;
  return res.status(statusCode).json(response);
};

exports.error = (res, statusCode, message) => {
  return res.status(statusCode).json({ success: false, message });
};

exports.paginated = (res, message, data, pagination) => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination,
  });
};
