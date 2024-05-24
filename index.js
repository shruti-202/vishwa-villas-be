require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const healthRoute = require("./routes/HealthRoute");
const authRoutes = require("./routes/AuthRoutes");

/*App*/
const app = express();
app.use(express.json());
app.use(
  cors({
    credentials: true,
    origin: ["https://vishwa-villas.vercel.app/", "http://localhost:5173"],
  })
);

/*Database Connection*/
mongoose.connect(process.env.DATABASE_URL);
mongoose.connection.once("connected", () => console.log("Database Connected"));
mongoose.connection.on("error", (err) => console.log("Database Error:", err));

/*Routes*/
app.use("/health", healthRoute);
app.use("/api/v1/auth", authRoutes);

/*Server Listen*/
app.listen(process.env.SERVER_PORT, () =>
  console.log(`App server started at ${process.env.SERVER_PORT}`)
);
