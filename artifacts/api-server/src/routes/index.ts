import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import settingsRouter from "./settings";
import servicesRouter from "./services";
import deploymentsRouter from "./deployments";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(settingsRouter);
router.use(servicesRouter);
router.use(deploymentsRouter);
router.use(adminRouter);

export default router;
