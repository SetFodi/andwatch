// app/api/user/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import connectDB from "../../../../lib/db";
import { User } from "../../../../lib/models/User";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid"; // You'll need to install this: npm install uuid @types/uuid

const uploadDir = path.join(process.cwd(), "public/uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log(`Created uploads directory at: ${uploadDir}`);
} else {
  console.log(`Uploads directory exists at: ${uploadDir}`);
}

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  const { id } = await context.params;

  if (!session || !session.user?.id || session.user.id !== id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const user = await User.findById(id).select("displayName avatar bio");
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json(user);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  console.log("PUT request received for user profile update");
  
  const session = await getServerSession(authOptions);
  const { id } = await context.params;

  if (!session || !session.user?.id || session.user.id !== id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    console.log("FormData received:", [...formData.entries()].map(([key]) => key));

    // Get text form fields
    const displayName = formData.get("displayName")?.toString() || "";
    const bio = formData.get("bio")?.toString() || "";
    
    // Get file from formData
    const file = formData.get("avatar") as File | null;
    console.log("File received:", file ? `${file.name} (${file.size} bytes)` : "No file");
    
    let avatarPath = null;
    
    // Process file if it exists
    if (file && file.size > 0) {
      // Check file type
      if (!file.type.startsWith("image/")) {
        return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 });
      }
      
      // Check file size (limit to 2MB)
      if (file.size > 2 * 1024 * 1024) {
        return NextResponse.json({ error: "File size exceeds limit (2MB)" }, { status: 400 });
      }
      
      // Create a unique filename
      const fileExt = path.extname(file.name);
      const fileName = `avatar_${id}_${uuidv4()}${fileExt}`;
      const filePath = path.join(uploadDir, fileName);
      
      // Convert file to Buffer and save it
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      // Write file to disk
      try {
        fs.writeFileSync(filePath, buffer);
        console.log("File saved successfully at:", filePath);
        
        // Set the avatar path for the user (relative to /public)
        avatarPath = `/uploads/${fileName}`;
      } catch (writeError) {
        console.error("Error writing file:", writeError);
        return NextResponse.json({ error: "Failed to save file" }, { status: 500 });
      }
    }
    
    // Update user in database
    await connectDB();
    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    if (displayName) user.displayName = displayName;
    if (bio) user.bio = bio;
    if (avatarPath) user.avatar = avatarPath;
    user.updatedAt = new Date();
    
    await user.save();
    console.log("User saved with avatar:", user.avatar);
    
    return NextResponse.json({ 
      message: "Profile updated successfully",
      avatar: user.avatar 
    });
  } catch (error: any) {
    console.error("Error updating profile:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}