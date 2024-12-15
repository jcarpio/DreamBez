import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { replicate } from "@/lib/replicate";
import { NextResponse } from 'next/server';
import { env } from "@/env.mjs";

export async function POST(request: Request, { params }: { params: { id: string } }) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { prompt, negative_prompt, aspectRatio, style } = await request.json();
        const studioId = params.id;
        
        const studio = await prisma.studio.findUnique({
          where: { id: studioId },
        });
        
        if (!studio) {
          return NextResponse.json({ error: "Studio not found" }, { status: 404 });
        }

        let aspect_ratio =  "9:16";
        const default_negative_prompt = "flaws in the eyes, flaws in the face, flaws, lowres, non-HDRi, low quality, worst quality,artifacts noise, text, watermark, glitch, deformed, mutated, ugly, disfigured, hands, low resolution, partially rendered objects,  deformed or partially rendered eyes, deformed, deformed eyeballs, cross-eyed,blurry,border, picture frame";
        const final_prompt = prompt.replace(`{prompt}`, `${studio.modelUser} a ${studio.type} with ${studio.defaultHairStyle} hair, ${studio.defaultUserHeight}cm tall `) + `, ${studio.modelUser} a ${studio.type} `;
        console.log("final_prompt", final_prompt);

        switch (aspectRatio) {
            case "Portrait":
                aspect_ratio = "9:16";
                break;
            case "Landscape":
                aspect_ratio = "16:9";
                break;
            case "Square":
                aspect_ratio = "1:1";
                break;
                
            default:
                return NextResponse.json({ error: "Invalid aspect ratio" }, { status: 400 });
        }

        const input = {
            /*
            main_face_image: studio.images[0],
            ...(studio.images.length > 1 && { auxiliary_face_image1: studio.images[1] }),
            ...(studio.images.length > 2 && { auxiliary_face_image2: studio.images[2] }),
            ...(studio.images.length > 3 && { auxiliary_face_image3: studio.images[3] }),
            prompt: final_prompt,
            negative_prompt: negative_prompt || default_negative_prompt,
            cfg_scale: 1.2,
            num_steps: 4,
            image_width: width,
            image_height: height,
            identity_scale: 0.8,
            generation_mode: "fidelity",
            num_samples: 1,
            output_format: "png"
              */
              // image: "https://replicate.delivery/pbxt/LgPu8vCag8fuxiWgWjsp3Mf10aLzK8xcDsoS6shzNr6k0Rri/diego_dreyfus_sombrero2.jpg",
              // prompt: "The image depicts a muscular joselapasion standing by a pool, set against a tropical, natural background with a distant view of lush greenery and a body of water, possibly the ocean. joselapasion is a man is 168 cm tall, shirtless, showcasing his fit and toned physique. He is wearing an used wide-brimmed black australian leather hat and sunglases john lennon style, giving off a relaxed yet stylish vibe.\n\njoselapasion has several visible tattoos on his arms and chest, including a notable tattoo near his collarbone. His expression is neutral, with slightly pursed lips as if he’s in the middle of speaking or thinking. He holds a small glass of what appears to be a beverage in his right hand. His left hand is casually raised, fingers slightly curled as though gesturing in conversation.\n\njoselapasion is wearing black swimming trunks that have a small orange logo or design near the left thigh. There’s a thin red bracelet around his left wrist, adding a subtle touch of color to his overall look. The setting appears serene and peaceful, with a bright, clear sky overhead and soft sunlight illuminating the scene.\n\n",    
              prompt: final_prompt,      
              // hf_lora: "enkire/replicate-joselapasion-lora-face",
              hf_lora: `${studio.hf_lora}`,
              lora_scale: 0.8,
              num_outputs: 1,
              aspect_ratio: aspect_ratio,
              output_format: "jpg",
              guidance_scale: 3.5,
              output_quality: 80,
              prompt_strength: 0.8,
              num_inference_steps: 28,
              disable_safety_checker: True
              
        };
        
        const webhookUrl = `${env.NEXT_PUBLIC_APP_URL}/api/webhooks/replicate`;
        console.log("webhookUrl", webhookUrl);
        const prediction = await prisma.prediction.create({
            data: {
                studioId,
                style: style,
                status: "pending",
            },
        });

        try {
            const output = await replicate.predictions.create({
                // version: "43d309c37ab4e62361e5e29b8e9e867fb2dcbcec77ae91206a8d95ac5dd451a0",
                // For test only joselapasion Repicate model
                // version: "613a21a57e8545532d2f4016a7c3cfa3c7c63fded03001c2e69183d557a929db",
                version: `${studio.modelVersion}`,
                input: input,
                webhook: `${webhookUrl}?predictionId=${prediction.id}`,
                webhook_events_filter: ["completed"]
            });

            // Update the prediction with the pId
            await prisma.prediction.update({
                where: { id: prediction.id },
                data: { 
                    pId: output.id,
                    status: "processing"
                },
            });

            return NextResponse.json({ success: true, predictionId: prediction.id });
        } catch (replicateError) {
            console.error("Error creating Replicate prediction:", replicateError);
            
            // Update prediction status to 'failed'
            await prisma.prediction.update({
                where: { id: prediction.id },
                data: { status: "failed" },
            });

            return NextResponse.json({ error: "Failed to create prediction" }, { status: 500 });
        }
    } catch (error) {
        console.error("Error in shoot route:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

