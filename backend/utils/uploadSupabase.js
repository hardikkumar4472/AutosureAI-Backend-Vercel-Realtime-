import dotenv from "dotenv";
dotenv.config();

import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export const uploadToSupabase = async (file) => {
  try {
    const ext = file.originalname.split(".").pop();
    const fileName = `${uuidv4()}.${ext}`;

    const { error } = await supabase.storage
      .from(process.env.SUPABASE_BUCKET)
      .upload(fileName, fs.createReadStream(file.path), {
        contentType: file.mimetype,
        duplex: "half",
      });

    if (error) throw error;

    const { data } = supabase.storage
      .from(process.env.SUPABASE_BUCKET)
      .getPublicUrl(fileName);

    return data.publicUrl;
  } catch (err) {
    console.error("Supabase upload error:", err.message);
    throw new Error("Failed to upload to Supabase");
  }
};

export const uploadPDFToSupabase = async (filePath, fileName) => {
  try {
    const { error } = await supabase.storage
      .from(process.env.SUPABASE_BUCKET)
      .upload(`reports/${fileName}`, fs.createReadStream(filePath), {
        contentType: "application/pdf",
        duplex: "half",
      });

    if (error) throw error;

    const { data } = supabase.storage
      .from(process.env.SUPABASE_BUCKET)
      .getPublicUrl(`reports/${fileName}`);

    return data.publicUrl;
  } catch (err) {
    console.error("Supabase PDF upload error:", err.message);
    throw new Error("Failed to upload PDF to Supabase");
  }
};