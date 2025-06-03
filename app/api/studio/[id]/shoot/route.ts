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

        let aspect_ratio = "9:16";
        const default_negative_prompt = "flaws in the eyes, flaws in the face, flaws, lowres, non-HDRi, low quality, worst quality,artifacts noise, text, watermark, glitch, deformed, mutated, ugly, disfigured, hands, low resolution, partially rendered objects,  deformed or partially rendered eyes, deformed, deformed eyeballs, cross-eyed,blurry,border, picture frame";
        const final_prompt = prompt.replace(`{prompt}`, `${studio.modelUser} a ${studio.type} with ${studio.defaultHairStyle} hair, ${studio.defaultUserHeight}cm tall `) + `, ${studio.modelUser} a ${studio.type} `;

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
            prompt: final_prompt,
            hf_lora: studio.hf_lora,
            lora_scale: 0.8,
            num_outputs: 1,
            aspect_ratio: aspect_ratio,
            output_format: "jpg",
            guidance_scale: 3.5,
            output_quality: 80,
            prompt_strength: 0.8,
            num_inference_steps: 28,
            disable_safety_checker: true,
            negative_prompt: negative_prompt || default_negative_prompt,
        };

        const webhookUrl = `${env.NEXT_PUBLIC_APP_URL}/api/webhooks/replicate`;
        let prediction;

        const modelIsBlackForest = studio.hf_lora?.startsWith("huggingface.co/");
        const modelVersion = modelIsBlackForest
            ? "black-forest-labs/flux-dev-lora"
            : studio.modelVersion ?? "";

        if (!modelVersion) {
            return NextResponse.json({ error: "Missing model version" }, { status: 400 });
        }

        try {
            prediction = await prisma.prediction.create({
                data: {
                    studioId,
                    style: style,
                    status: "pending",
                },
            });

            const output = await replicate.predictions.create({
                version: modelVersion,
                input,
                webhook: `${webhookUrl}?predictionId=${prediction.id}`,
                webhook_events_filter: ["completed"]
            });

            await prisma.prediction.update({
                where: { id: prediction.id },
                data: {
                    pId: output.id,
                    status: "processing",
                },
            });

            return NextResponse.json({ success: true, predictionId: prediction.id });

        } catch (replicateError) {
            console.error("Error creating Replicate prediction:", replicateError);

            if (prediction?.id) {
                await prisma.prediction.update({
                    where: { id: prediction.id },
                    data: { status: "failed" },
                });
            }

            return NextResponse.json({ error: "Failed to create prediction" }, { status: 500 });
        }

    } catch (error) {
        console.error("Error in shoot route:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
