import { NextResponse } from "next/server";
import connectDB from "../../../../lib/db";
import { User } from "../../../../lib/models/User";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    await connectDB();

    const normalizedEmail = email.toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email is already registered" },
        { status: 409 }
      );
    }

    // Log the raw password for debugging (remove in production)
    console.log("Signup - Raw Password:", password);

    // Pass the raw password to the User model so its pre-save hook can hash it.
    const newUser = new User({
      email: normalizedEmail,
      password: password, // raw password
      name: normalizedEmail.split('@')[0],
    });

    await newUser.save();

    return NextResponse.json(
      { message: "User created successfully" },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Something went wrong during sign up" },
      { status: 500 }
    );
  }
}
