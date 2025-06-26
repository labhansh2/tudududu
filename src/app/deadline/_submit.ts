import { auth } from "@clerk/nextjs/server";
import { db } from "@/drizzle";
import { deadlines } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function submitDeadline(formData: FormData): Promise<{ success: boolean; error?: string }> {
    'use server'
    const deadline = formData.get('deadline') as string;
    const { userId } = await auth();
    
    if (!userId) {
      return { success: false, error: "User not authenticated" };
    }
  
    // Server-side validation for past dates
    const selectedDate = new Date(deadline);
    const now = new Date();
    
    if (selectedDate <= now) {
      return { success: false, error: "Deadline must be in the future" };
    }
    
    try {
      // Check if deadline exists for user
      const existing = await db.select().from(deadlines).where(eq(deadlines.userId, userId));
      if (existing.length > 0) {
        // Update
        await db.update(deadlines)
          .set({ deadline: new Date(deadline) })
          .where(eq(deadlines.userId, userId));
      } else {
        // Insert
        await db.insert(deadlines).values({
          userId: userId,
          deadline: new Date(deadline)
        });
      }
    } catch (error) {
      console.error(error);
      return { success: false, error: "Database error occurred" };
    }
    
    // Only redirect if the database operation was successful
    revalidatePath("/");
    redirect("/");
  }