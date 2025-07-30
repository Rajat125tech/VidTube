import {Router} from "express";

import { healthcheck } from "../controllers/heathcheck.controller.js";

const router = Router();

router.route("/").get(healthcheck);

export default router;