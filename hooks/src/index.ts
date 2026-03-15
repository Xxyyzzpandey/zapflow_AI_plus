// import express from "express"
// import {PrismaClient}  from "@prisma/client"

// const app=express();

// const client=new PrismaClient();

// app.use(express.json());

// //https://hooks.zapier.com/hooks/catch/223345/848489/

// //@ts-ignore
// app.post("/hooks/catch/:userId/:zapId", async (req, res) => {
//   const { userId, zapId } = req.params;
//   const body = req.body;

//   //@ts-ignore
//   await client.$transaction(async tx => {
//     const run = await tx.zapRun.create({
//       data: {
//         zapId,
//         metadata: body
//       }
//     });

//     await tx.zapRunOutbox.create({
//       data: {
//         zapRunId: run.id
//       }
//     });
//   }, { timeout: 10000,
//        maxWait: 5000
//    });

//   res.json({ success: true, zapId, userId, received: body });
// });

// app.listen(3002,()=>{console.log("server is running at port 3002...")})


// ======================================================================================================================

import express from "express"
import {PrismaClient}  from "@prisma/client"
import { executeZap } from "./executor/executeLogic";
const app=express();

const client=new PrismaClient();

app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

//https://hooks.zapier.com/hooks/catch/223345/848489/
//@ts-ignore
app.post("/hooks/catch/:userId/:zapId", async (req, res) => {
  const { userId, zapId } = req.params;
  const body = req.body;
  console.log(req.params);
  // 1. Log the run in the database
  const zapRun = await client.zapRun.create({
    data: { zapId, metadata: body }
  });

  // 2. TRIGGER EXECUTION IMMEDIATELY
  // Fire-and-forget: we don't await this, so the API returns immediately.
  executeZap(zapRun.id, 0).catch(err => console.error("Zap Execution Error:", err));

  return res.json({ success: true, runId: zapRun.id });
});
app.listen(3002,()=>{console.log("server is running at port 3002...")})



