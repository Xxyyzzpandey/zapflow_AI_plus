import express from "express"
import { zapRouter } from "./router/zap";
import { userRouter } from "./router/user";
import  {triggerRouter} from "./router/trigger"
import { actionRouter } from "./router/action";
import aizapRoute from "./router/aizap"
import cors from "cors"
import dotenv from "dotenv"
import { userSecret } from "./router/userSecret";

const app=express();
app.use(express.json())
app.use(cors());

dotenv.config()

app.use("/api/v1/user",userRouter);
app.use("/api/v1/zap",zapRouter);
app.use("/api/v1/trigger",triggerRouter);
app.use("/api/v1/action",actionRouter);
app.use("/api/v2/zap",aizapRoute);
app.use("/api/v2",userSecret);

app.listen(3000,()=>console.log("backend listening at port 3000"))