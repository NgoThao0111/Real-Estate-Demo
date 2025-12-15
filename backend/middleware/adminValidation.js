import Joi from "joi";

export const validateBroadcast = (req, res, next) => {
  const schema = Joi.object({
    title: Joi.string().min(3).max(200).required(),
    message: Joi.string().min(1).max(2000).required(),
    type: Joi.string().valid("info", "warning", "alert").default("info"),
    audience: Joi.string().valid("all", "admins", "users").default("all"),
  });

  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  req.body = value;
  next();
};

export const validateStatusUpdate = (req, res, next) => {
  const schema = Joi.object({ status: Joi.string().required() });
  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  req.body = value;
  next();
};

export const validateToggleBan = (req, res, next) => {
  const schema = Joi.object({ ban: Joi.boolean().required() });
  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  req.body = value;
  next();
};
