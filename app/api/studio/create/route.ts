import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export const POST = auth(async (req) => {
  if (!req.auth || !req.auth.user || !req.auth.user.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const { name, type, modelUser, modelVersion, hf_lora, defaultHairStyle, defaultUserHeight, extraInfo, images } = await req.json();

    if (!name || !type || !modelUser || !modelVersion || !hf_lora || !defaultHairStyle || !defaultUserHeight || !extraInfo || !images || images.length === 0) {
      return new Response("Missing required fields", { status: 400 });
    }

    const studio = await prisma.studio.create({
      data: {
        name,
        type,
        modelUser,
        modelVersion,
        hf_lora,
        defaultHairStyle,
        defaultUserHeight,
        extraInfo,                   // added for future needs
        images,
        userId: req.auth.user.id,
      },
    });

    return Response.json(studio);
  } catch (error) {
    console.error("Error creating studio:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
});
