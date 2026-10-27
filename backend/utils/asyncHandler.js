// Lets controllers be async without a try/catch in every one.
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
export default asyncHandler;
