import { MongoClient } from "mongodb";

const uri = "mongodb+srv://db_user:Asd123@cluster0.kqbv84i.mongodb.net/collaborative3dapp?retryWrites=true&w=majority";
const client = new MongoClient(uri);

async function test() {
  try {
    await client.connect();
    console.log("✅ MongoDB connected");
    await client.close();
  } catch (err) {
    console.error("❌ Connection failed:", err);
  }
}

test();
