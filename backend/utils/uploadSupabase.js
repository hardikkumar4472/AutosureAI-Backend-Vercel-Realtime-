import dotenv from "dotenv";
dotenv.config();

import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import os from "os";
import path from "path";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export const uploadToSupabase = async (file) => {
  let tempFilePath = null;
  
  try {
    const ext = file.originalname.split(".").pop();
    const fileName = `${uuidv4()}.${ext}`;
    
    // Handle file differently based on whether it's buffer or path
    if (file.buffer) {
      // Memory storage (Vercel) - write buffer to temp file
      tempFilePath = path.join(os.tmpdir(), `upload_temp_${fileName}`);
      fs.writeFileSync(tempFilePath, file.buffer);
      
      const { error } = await supabase.storage
        .from(process.env.SUPABASE_BUCKET)
        .upload(fileName, fs.createReadStream(tempFilePath), {
          contentType: file.mimetype,
          duplex: "half",
        });

      if (error) throw error;
    } else if (file.path) {
      // Disk storage (local development)
      const { error } = await supabase.storage
        .from(process.env.SUPABASE_BUCKET)
        .upload(fileName, fs.createReadStream(file.path), {
          contentType: file.mimetype,
          duplex: "half",
        });

      if (error) throw error;
    } else {
      throw new Error("Invalid file object - no buffer or path");
    }

    const { data } = supabase.storage
      .from(process.env.SUPABASE_BUCKET)
      .getPublicUrl(fileName);

    // Clean up temp file if created
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath);
      } catch (e) {
        console.warn("Failed to delete temp file:", e.message);
      }
    }

    return data.publicUrl;
  } catch (err) {
    // Clean up on error
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath);
      } catch (e) {}
    }
    
    console.error("Supabase upload error:", err.message);
    throw new Error("Failed to upload to Supabase");
  }
};

export const uploadPDFToSupabase = async (filePath, fileName) => {
  try {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`PDF file not found at path: ${filePath}`);
    }

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
