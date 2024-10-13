export const categories = [
    { name: 'All', id: 'all' },
    { name: 'Woman Creative', id: 'woman-creative' },
    { name: 'Man Creative', id: 'man-creative' },
    { name: 'Woman Studio', id: 'woman-studio' },
    { name: 'Man Studio', id: 'man-studio' },
    { name: 'Man Dreams', id: 'man-dream' },

];

export const styles = [
    {
        name: "Comics",
        img: "comics.jpg",
        prompt: "color comic of {prompt}, graphic illustration, comic art, headshot, graphic novel art, vibrant, highly detailed",
        negative_prompt: "photograph, deformed, glitch, noisy, realistic, stock photo,border, picture frame",
        category: "man-creative"
    },
    {
        name: "Line Art",
        img: "line-art.jpg",
        prompt: "line art drawing of {prompt}, portrait, sleek, modern, minimalist, graphic, line art, vector graphics",
        negative_prompt: "anime, photorealistic, 35mm film, deformed, glitch, blurry, noisy, off- center, deformed, cross - eyed, closed eyes, bad anatomy, ugly, disfigured, mutated, realism, realistic, impressionism, expressionism, oil, acrylic,border, picture frame",
        category: "man-creative"
    },
    {
        name: "Watercolor",
        img: "watercolor.jpg",
        prompt: "Watercolor painting of {prompt} ,portrait,Vibrant, beautiful, painterly, detailed, textural, artistic",
        negative_prompt: "anime, photorealistic, 35mm film, deformed, glitch, low contrast, noisy,border, picture frame,",
        category: "man-creative",
        isNew: true
    },
    {
        name: "Impressionism",
        img: "impressionism.jpg",
        prompt: "Portrait, impressionist painting of {prompt}, loose brushwork, vibrant color, light and shadow play, headshot, artistic",
        negative_prompt: "",
        category: "man-creative",
        hot: true
    },
    {
        name: "Clay",
        img: "clay.jpg",
        prompt: "claymotion, made-of-clay, stopmotion, polymer clay, ultra light clay, {prompt}, High quality, details, cartoonish, 8k",
        negative_prompt: "",
        category: "man-creative",
    },
    {
        name: "Astronaut",
        img: "astronaut.jpg",
        prompt: "Portrait of {prompt} as an astronaut, futuristic,  ultra  highly detailed,realistic, concept art, intricate textures, interstellar background, space travel, art by alphonse mucha, ryan kittleson, greg rutkowski, leesha hannigan, stephan martiniere, stanley artgerm lau",
        negative_prompt: "",
        category: "man-creative",
    },
    {
        name: "Cyberpunk",
        img: "cyberpunk.jpg",
        prompt: "cyberpunk style of {prompt} , vibes, vibrant,Neon lights, stunningly beautiful, crisp, detailed, sleek, ultramodern, highlights,  shadows, high contrast, cinematic, ultra detailed, intricate, professional",
        negative_prompt: "painting, drawing, illustration, glitch, deformed, mutated, cross-eyed, ugly, disfigured",
        category: "man-creative",
        isNew: true
    },
    {
        name: "Popmart 3D",
        img: "popmart-3d.jpg",
        prompt: "Solo, popmart Blind Box Adorable 3D Character, {prompt}, solo, beautiful, detailed, 3D render, adorable character, 3D art",
        negative_prompt: "ugly, deformed, noisy, blurry, low contrast, grunge, sloppy, unkempt, photograph, photo, realistic, border, picture frame, text, watermark",
        category: "man-creative",
        isNew: true
    },
    {
        name: "Viking",
        img: "viking.jpg",
        prompt:"Closeup portrait painting of {prompt} as a viking, ultra realistic, concept art, intricate details, powerful and fierce, highly detailed, photorealistic, octane render, 8 k, unreal engine. art by artgerm and greg rutkowski and charlie bowater and magali villeneuve and alphonse mucha, golden hour, horns and braids in hair, fur-lined cape and helmet, axe in hand, looking towards the camera",
        negative_prompt: "",
        category: "man-creative"
    },
    {
        name: "Paladin",
        img: "paladin.jpg",
        prompt: "Closeup portrait of {prompt} as a paladin, wearing brilliant white armor and a crown, fantasy concept art, artstation trending, highly detailed, beautiful landscape in the background, art by wlop, greg rutkowski, thierry doizon, charlie bowater, alphonse mucha, golden hour lighting, ultra realistic",
        negative_prompt: "",
        category: "man-creative"
    },
    {
        name: "Hobbit",
        img: "hobbit.jpg",
        prompt: "Closeup portrait of {prompt} as a Hobbit, small, big brown eyes, green and brown clothing, detailed facial features, small feet, wispy hair, fantasy concept art, artstation trending, highly detailed, art by John Howe, Alan Lee, and Weta Workshop, earthy colors, looking into camera",
        negative_prompt: "",
        category: "man-creative"
    },
    {
        name: "Jedi",
        img: "jedi.jpg",
        prompt: "Closeup portrait of {prompt} as a jedi with a lightsaber, highly detailed, science fiction, star wars concept art, intricate details, bright colors, golden hour, art by marko djurdjevic, greg rutkowski, wlop, fredperry, digital painting, rossdraws",
        negative_prompt: "",
        category: "man-creative"
    },
    {
        name: "Harry Potter",
        img: "harry-potter.jpg",
        prompt:"Closeup portrait of {prompt} as a Harry Potter character, magical world, wands, robes, Hogwarts castle in the background, enchanted forest, detailed lighting, art by jim kay, charlie bowater, alphonse mucha, ronald brenzell, digital painting, concept art",
        negative_prompt: "",
        category: "man-creative"
    },
    {
        name: "Elf",
        img: "elf.jpg",
        prompt:"Closeup portrait of {prompt} as an elf with long blond hair, fantasy concept art, intricate details, detailed armor, majestic background, art by wlop, Greg Rutkowski, digital painting, smooth lighting, looking towards the viewer",
        negative_prompt: "",
        category: "man-creative"
    },
    {
        name: "Clown",
        img: "clown.jpg",
        prompt:"Closeup portrait of {prompt} as a clown, highly detailed, surreal, expressionless face, bright colors, contrast lighting, abstract background, art by wlop, greg rutkowski, charlie bowater, magali villeneuve, alphonse mucha, cartoonish, comic book style",
        negative_prompt: "",
        category: "man-creative"
    },
    {
        name: "Wizard",
        img: "wizard.jpg",
        prompt:"Closeup portrait of {prompt} as a wizard, highly detailed {prompt}, fantasy concept art, intricate details and textures, magical, colorful, art by wlop, greg rutkowski, charlie bowater, magali villeneuve, alphonse mucha, surreal, {prompt} looking into the distance, holding a staff, fire and stars in the background",
        negative_prompt: "",
        category: "man-creative"
    },
    {
        name: "Samurai",
        img: "samurai.jpg",
        prompt:"Closeup portrait of {prompt} as a samurai warrior, war-torn landscape in the background, wearing a black and red armor, ready to fight, detailed textures, concept art, noir art, art by hinata matsumura, alphonse mucha, mike mignola, kazu kibuishi, and rev.matsuoka, digital painting, ultra-realistic",
        negative_prompt: "",
        category: "man-creative"
    },
    {
        name: "Ninja",
        img: "ninja.jpg",
        prompt:"Closeup portrait of {prompt} as a ninja, wearing a black hood and suit, stealthy movements, dark night background, shadows and mist, detailed and realistic, art by kazuya yamashita, yuya kanzaki, yang zhizhuo, digital painting, photorealism, 8k resolution",
        negative_prompt: "",
        category: "man-creative"
    },
    {
        name: "Pirate",
        img: "pirate.jpg",
        prompt:"Closeup portrait of {prompt} as a pirate, wild and crazy, bandana, eye patch, golden hoop earrings, tattered and ripped clothes, detailed tattoos, rough and rugged, art by alphonse mucha, kai carpenter, ignacio fernandez rios, charlie bowater, noir photorealism, ultra real",
        negative_prompt: "",
        category: "man-creative"
    },
    {
        name: "Superhero",
        img: "superhero.jpg",
        prompt:"Closeup portrait of {prompt} as a superhero, dynamic lighting, intense colors, detailed costume, artstation trending, art by alphonse mucha, greg rutkowski, ross tran, leesha hannigan, ignacio fernandez rios, kai carpenter, noir photorealism, film",
        negative_prompt: "",
        category: "man-creative"
    },
    {
        name: "Knight",
        img: "knight.jpg",
        prompt:"Closeup portrait of {prompt} as a knight, wearing a full suit of armor, intricate details, majestic and powerful, bright shining silver armor, matching blue cape, a golden crown, artstation trending, highly detailed, digital painting, art by wlop, greg rutkowski, and charlie bowater",
        negative_prompt: "",
        category: "man-creative"
    },
    {
        name: "Cyborg",
        img: "cyborg.jpg",
        prompt:"Closeup portrait of {prompt} as a cyborg, mechanical parts, ultra realistic, concept art, intricate details, eerie, highly detailed, photorealistic, 8k, unreal engine. art by artgerm and greg rutkowski and charlie bowater and magali villeneuve and alphonse mucha, golden hour, cyberpunk, robotic, steampunk, neon colors, metallic textures",
        negative_prompt: "",
        category: "man-creative"
    },
    {
        name: "Monster",
        img: "monster.jpg",
        prompt:"Closeup portrait of {prompt} as monster, with glowing eyes and sharp teeth, dark shadows, foggy background, highly detailed, photorealism, concept art, digital painting, art by yahoo kim, max grecke, james white, viktor hulík, fabrizio bortolussi",
        negative_prompt: "",
        category: "man-creative"
    },
    {
        name: "Vampire",
        img: "vampire.jpg",
        prompt:"Closeup portrait of {prompt} as a vampire, pale skin, dark eyes, sharp fangs, detailed shadows and highlights, eerie atmosphere, mystical and magical, art by leesha hannigan, thierry doizon, alphonse mucha, kai carpenter, noir photorealism, surreal and dreamlike, deep red hues",
        negative_prompt: "",
        category: "man-creative"
    },
    {
        name: "Zombie",
        img: "zombie.jpg",
        prompt:"Closeup portrait of {prompt} as a zombie, decaying skin and clothing, dark and eerie, highly detailed, photorealistic, 8k, ultra realistic, horror style, art by greg rutkowski, charlie bowater, and magali villeneuve",
        negative_prompt: "",
        category: "man-creative"
    },
    {
        name: "Witch",
        img: "witch.jpg",
        prompt:"Closeup portrait of {prompt} as a witch, surrounded by magical elements, highly detailed, photorealism, digital painting, dark colors, grayscale, intricate details, art by yuumei, greg rutkowski, eddie hong, and charlie bowater, ultra realism, magical elements",
        negative_prompt: "",
        category: "man-creative"
    },

    {
        name: "Pro 1 (Dark Bg)",
        img: "pro-1-dark-bg.jpg",
        prompt: "business headshot of {prompt}, dark background, in a suit, portrait photo,dark background, Half-body digital photo , realistic, highly detailed, photorealistic, 8k, looking towards the camera",
        negative_prompt: "flaws in the eyes, flaws in the face, flaws, lowres, non-HDRi, low quality, worst quality,artifacts noise, text, watermark, glitch, deformed, mutated, ugly, disfigured, hands, low resolution, partially rendered objects,  deformed or partially rendered eyes, deformed, deformed eyeballs, cross-eyed,blurry,border, picture frame",
        category: "man-studio"
    },
    {
        name: "Pro 2 (Light Bg)",
        img: "pro-2-light-bg.jpg",
        prompt: "business headshot of {prompt}, White background, in a suit, portrait photo,White background , Half-body digital photo , realistic, highly detailed, photorealistic, 8k, looking towards the camera",
        negative_prompt: "",
        category: "man-studio",
        isNew: true
    },
    {
        name: "Office",
        img: "office.jpg",
        prompt: "business headshot of {prompt}, in the office, office background, in a suit, portrait photo,IT office, Half-body digital photo , realistic, highly detailed, photorealistic, 8k, looking towards the camera ",
        negative_prompt: "",
        category: "man-studio"
    },
    {
        name: "ID Photo",
        img: "id_photo.jpg",
        prompt: "ID Photo of {prompt}, professional, clean background, headshot portrait photo, white background, Half-body digital photo , realistic, highly detailed, photorealistic, 8k, looking towards the camera",
        negative_prompt: "",
        category: "man-studio"
    },
    {
        name: "Park",
        img: "park.jpg",
        prompt: "headshot of {prompt}, park background, in a suit, portrait photo,park background, Half-body digital photo , realistic, highly detailed, photorealistic, 8k, looking towards the camera",
        negative_prompt: "",
        category: "man-studio",
        hot: true
    },
    {
        name: "Real Estate",
        img: "real-estate.jpg",
        prompt: "headshot of {prompt} as Real Estate Agent, outdoor house background, in a suit, house background, Half-body digital photo , realistic, highly detailed, photorealistic, 8k, looking towards the camera",
        negative_prompt: "",
        category: "man-studio"
    },
    {
        name: "Cafe",
        img: "cafe.jpg",
        prompt: "headshot of {prompt}, leisure Informal clothing, in cafe background, cafe background, Half-body digital photo , realistic, highly detailed, photorealistic, 8k, looking towards the camera",
        negative_prompt: "",
        category: "man-studio",
    },
    {
        name: "Bookshelf",
        img: "bokshelf.jpg",
        prompt: "headshot of {prompt}, bookshelf background,bookshelf background, Half-body digital photo , realistic, highly detailed, photorealistic, 8k, looking towards the camera",
        negative_prompt: "",
        category: "man-studio",
        hot: true
    },
    {
        name: "Yacht",
        img: "yacht.jpg",
        prompt: "headshot of {prompt}, Leisure Informal clothing, with a Yacht background,Yacht background, Half-body digital photo , realistic, highly detailed, photorealistic, 8k, looking towards the camera",
        negative_prompt: "",
        category: "man-studio"
    },
    {
        name: "Theater",
        img: "theater.jpg",
        prompt: "headshot of {prompt}, Leisure Informal clothing, in a Theater background,Theater background, Half-body digital photo , realistic, highly detailed, photorealistic, 8k, looking towards the camera",
        negative_prompt: "",
        category: "man-studio",
        isNew: true
    },
    {
        name: "Summer Luxe",
        img: "summer-luxe.jpg",
        prompt: "headshot of {prompt}, leisure Informal clothing, in a Summer Luxe seaside background, seaside background, Half-body digital photo , realistic, highly detailed, photorealistic, 8k, looking towards the camera",
        negative_prompt: "",
        category: "man-studio",
    },
    {
        name: "B&W",
        img: "b-w.jpg",
        prompt: "b&w business headshot of {prompt},only Black and white colors, in a suit, portrait photo, Half-body digital photo , realistic, highly detailed, photorealistic, 8k, looking towards the camera",
        negative_prompt: "",
        category: "man-studio"
    },
    {
        name: "Comics",
        img: "woman-comics.jpg",
        prompt: "color comic of {prompt}, graphic illustration, comic art, headshot, graphic novel art, vibrant, highly detailed",
        negative_prompt: "photograph, deformed, glitch, noisy, realistic, stock photo,border, picture frame",
        category: "woman-creative"
    },
    {
        name: "Line Art",
        img: "woman-line-art.jpg",
        prompt: "line art drawing of {prompt}, portrait, sleek, modern, minimalist, graphic, line art, vector graphics",
        negative_prompt: "anime, photorealistic, 35mm film, deformed, glitch, blurry, noisy, off- center, deformed, cross - eyed, closed eyes, bad anatomy, ugly, disfigured, mutated, realism, realistic, impressionism, expressionism, oil, acrylic,border, picture frame",
        category: "woman-creative"
    },
    {
        name: "Watercolor",
        img: "woman-watercolor.jpg",
        prompt: "Watercolor painting of {prompt} ,portrait,Vibrant, beautiful, painterly, detailed, textural, artistic",
        negative_prompt: "anime, photorealistic, 35mm film, deformed, glitch, low contrast, noisy,border, picture frame,",
        category: "woman-creative",
        isNew: true
    },
    {
        name: "Impressionism",
        img: "woman-impressionism.jpg",
        prompt: "Portrait, impressionist painting of {prompt}, loose brushwork, vibrant color, light and shadow play, headshot, artistic",
        negative_prompt: "",
        category: "woman-creative",
        hot: true
    },
    {
        name: "Clay",
        img: "woman-clay.jpg",
        prompt: "claymotion, made-of-clay, stopmotion, polymer clay, ultra light clay, {prompt}, High quality, details, cartoonish, 8k",
        negative_prompt: "",
        category: "woman-creative",
    },
    {
        name: "Astronaut",
        img: "woman-astronaut.jpg",
        prompt: "Portrait of {prompt} as an astronaut, futuristic,  ultra  highly detailed,realistic, concept art, intricate textures, interstellar background, space travel, art by alphonse mucha, ryan kittleson, greg rutkowski, leesha hannigan, stephan martiniere, stanley artgerm lau",
        negative_prompt: "",
        category: "woman-creative",
    },
    {
        name: "Cyberpunk",
        img: "woman-cyberpunk.jpg",
        prompt: "cyberpunk style of {prompt} , vibes, vibrant,Neon lights, stunningly beautiful, crisp, detailed, sleek, ultramodern, highlights,  shadows, high contrast, cinematic, ultra detailed, intricate, professional",
        negative_prompt: "painting, drawing, illustration, glitch, deformed, mutated, cross-eyed, ugly, disfigured",
        category: "woman-creative",
        isNew: true
    },
    {
        name: "Popmart 3D",
        img: "woman-popmart-3d.jpg",
        prompt: "Solo, popmart Blind Box Adorable 3D Character, {prompt}, solo, beautiful, detailed, 3D render, adorable character, 3D art",
        negative_prompt: "ugly, deformed, noisy, blurry, low contrast, grunge, sloppy, unkempt, photograph, photo, realistic, border, picture frame, text, watermark",
        category: "woman-creative",
        isNew: true
    },
    {
        name: "Viking",
        img: "woman-viking.jpg",
        prompt:"Closeup portrait painting of {prompt} as a viking, ultra realistic, concept art, intricate details, powerful and fierce, highly detailed, photorealistic, octane render, 8 k, unreal engine. art by artgerm and greg rutkowski and charlie bowater and magali villeneuve and alphonse mucha, golden hour, horns and braids in hair, fur-lined cape and helmet, axe in hand, looking towards the camera",
        negative_prompt: "",
        category: "woman-creative"
    },
    {
        name: "Paladin",
        img: "woman-paladin.jpg",
        prompt: "Closeup portrait of {prompt} as a paladin, wearing brilliant white armor and a crown, fantasy concept art, artstation trending, highly detailed, beautiful landscape in the background, art by wlop, greg rutkowski, thierry doizon, charlie bowater, alphonse mucha, golden hour lighting, ultra realistic",
        negative_prompt: "",
        category: "woman-creative"
    },
    {
        name: "Hobbit",
        img: "woman-hobbit.jpg",
        prompt: "Closeup portrait of {prompt} as a Hobbit, small, big brown eyes, green and brown clothing, detailed facial features, small feet, wispy hair, fantasy concept art, artstation trending, highly detailed, art by John Howe, Alan Lee, and Weta Workshop, earthy colors, looking into camera",
        negative_prompt: "",
        category: "woman-creative"
    },
    {
        name: "Jedi",
        img: "woman-jedi.jpg",
        prompt: "Closeup portrait of {prompt} as a jedi with a lightsaber, highly detailed, science fiction, star wars concept art, intricate details, bright colors, golden hour, art by marko djurdjevic, greg rutkowski, wlop, fredperry, digital painting, rossdraws",
        negative_prompt: "",
        category: "woman-creative"
    },
    {
        name: "Harry Potter",
        img: "woman-harry-potter.jpg",
        prompt:"Closeup portrait of {prompt} as a Harry Potter character, magical world, wands, robes, Hogwarts castle in the background, enchanted forest, detailed lighting, art by jim kay, charlie bowater, alphonse mucha, ronald brenzell, digital painting, concept art",
        negative_prompt: "",
        category: "woman-creative"
    },
    {
        name: "Elf",
        img: "woman-elf.jpg",
        prompt:"Closeup portrait of {prompt} as an elf with long blond hair, fantasy concept art, intricate details, detailed armor, majestic background, art by wlop, Greg Rutkowski, digital painting, smooth lighting, looking towards the viewer",
        negative_prompt: "",
        category: "woman-creative"
    },
    {
        name: "Clown",
        img: "woman-clown.jpg",
        prompt:"Closeup portrait of {prompt} as a clown, highly detailed, surreal, expressionless face, bright colors, contrast lighting, abstract background, art by wlop, greg rutkowski, charlie bowater, magali villeneuve, alphonse mucha, cartoonish, comic book style",
        negative_prompt: "",
        category: "woman-creative"
    },
    {
        name: "Wizard",
        img: "woman-wizard.jpg",
        prompt:"Closeup portrait of {prompt} as a wizard, highly detailed {prompt}, fantasy concept art, intricate details and textures, magical, colorful, art by wlop, greg rutkowski, charlie bowater, magali villeneuve, alphonse mucha, surreal, {prompt} looking into the distance, holding a staff, fire and stars in the background",
        negative_prompt: "",
        category: "woman-creative"
    },
    {
        name: "Samurai",
        img: "woman-samurai.jpg",
        prompt:"Closeup portrait of {prompt} as a samurai warrior, war-torn landscape in the background, wearing a black and red armor, ready to fight, detailed textures, concept art, noir art, art by hinata matsumura, alphonse mucha, mike mignola, kazu kibuishi, and rev.matsuoka, digital painting, ultra-realistic",
        negative_prompt: "",
        category: "woman-creative"
    },
    {
        name: "Ninja",
        img: "woman-ninja.jpg",
        prompt:"Closeup portrait of {prompt} as a ninja, wearing a black hood and suit, stealthy movements, dark night background, shadows and mist, detailed and realistic, art by kazuya yamashita, yuya kanzaki, yang zhizhuo, digital painting, photorealism, 8k resolution",
        negative_prompt: "",
        category: "woman-creative"
    },
    {
        name: "Pirate",
        img: "woman-pirate.jpg",
        prompt:"Closeup portrait of {prompt} as a pirate, wild and crazy, bandana, eye patch, golden hoop earrings, tattered and ripped clothes, detailed tattoos, rough and rugged, art by alphonse mucha, kai carpenter, ignacio fernandez rios, charlie bowater, noir photorealism, ultra real",
        negative_prompt: "",
        category: "woman-creative"
    },
    {
        name: "Superhero",
        img: "woman-superhero.jpg",
        prompt:"Closeup portrait of {prompt} as a superhero, dynamic lighting, intense colors, detailed costume, artstation trending, art by alphonse mucha, greg rutkowski, ross tran, leesha hannigan, ignacio fernandez rios, kai carpenter, noir photorealism, film",
        negative_prompt: "",
        category: "woman-creative"
    },
    {
        name: "Knight",
        img: "woman-knight.jpg",
        prompt:"Closeup portrait of {prompt} as a knight, wearing a full suit of armor, intricate details, majestic and powerful, bright shining silver armor, matching blue cape, a golden crown, artstation trending, highly detailed, digital painting, art by wlop, greg rutkowski, and charlie bowater",
        negative_prompt: "",
        category: "woman-creative"
    },
    {
        name: "Cyborg",
        img: "woman-cyborg.jpg",
        prompt:"Closeup portrait of {prompt} as a cyborg, mechanical parts, ultra realistic, concept art, intricate details, eerie, highly detailed, photorealistic, 8k, unreal engine. art by artgerm and greg rutkowski and charlie bowater and magali villeneuve and alphonse mucha, golden hour, cyberpunk, robotic, steampunk, neon colors, metallic textures",
        negative_prompt: "",
        category: "woman-creative"
    },
    {
        name: "Monster",
        img: "woman-monster.jpg",
        prompt:"Closeup portrait of {prompt} as monster, with glowing eyes and sharp teeth, dark shadows, foggy background, highly detailed, photorealism, concept art, digital painting, art by yahoo kim, max grecke, james white, viktor hulík, fabrizio bortolussi",
        negative_prompt: "",
        category: "woman-creative"
    },
    {
        name: "Vampire",
        img: "woman-vampire.jpg",
        prompt:"Closeup portrait of {prompt} as a vampire, pale skin, dark eyes, sharp fangs, detailed shadows and highlights, eerie atmosphere, mystical and magical, art by leesha hannigan, thierry doizon, alphonse mucha, kai carpenter, noir photorealism, surreal and dreamlike, deep red hues",
        negative_prompt: "",
        category: "woman-creative"
    },
    {
        name: "Zombie",
        img: "woman-zombie.jpg",
        prompt:"Closeup portrait of {prompt} as a zombie, decaying skin and clothing, dark and eerie, highly detailed, photorealistic, 8k, ultra realistic, horror style, art by greg rutkowski, charlie bowater, and magali villeneuve",
        negative_prompt: "",
        category: "woman-creative"
    },
    {
        name: "Witch",
        img: "woman-witch.jpg",
        prompt:"Closeup portrait of {prompt} as a witch, surrounded by magical elements, highly detailed, photorealism, digital painting, dark colors, grayscale, intricate details, art by yuumei, greg rutkowski, eddie hong, and charlie bowater, ultra realism, magical elements",
        negative_prompt: "",
        category: "woman-creative"
    },

    {
        name: "Pro 1 (Dark Bg)",
        img: "woman-pro-1-dark-bg.jpg",
        prompt: "business headshot of {prompt}, dark background, in a suit, portrait photo,dark background, Half-body digital photo , realistic, highly detailed, photorealistic, 8k, looking towards the camera",
        negative_prompt: "flaws in the eyes, flaws in the face, flaws, lowres, non-HDRi, low quality, worst quality,artifacts noise, text, watermark, glitch, deformed, mutated, ugly, disfigured, hands, low resolution, partially rendered objects,  deformed or partially rendered eyes, deformed, deformed eyeballs, cross-eyed,blurry,border, picture frame",
        category: "woman-studio"
    },
    {
        name: "Pro 2 (Light Bg)",
        img: "woman-pro-2-light-bg.jpg",
        prompt: "business headshot of {prompt}, White background, in a suit, portrait photo,White background , Half-body digital photo , realistic, highly detailed, photorealistic, 8k, looking towards the camera",
        negative_prompt: "",
        category: "woman-studio",
        isNew: true
    },
    {
        name: "Office",
        img: "woman-office.jpg",
        prompt: "business headshot of {prompt}, in the office, office background, in a suit, portrait photo,IT office, Half-body digital photo , realistic, highly detailed, photorealistic, 8k, looking towards the camera ",
        negative_prompt: "",
        category: "woman-studio"
    },
    {
        name: "ID Photo",
        img: "woman-id_photo.jpg",
        prompt: "ID Photo of {prompt}, professional, clean background, headshot portrait photo, white background, Half-body digital photo , realistic, highly detailed, photorealistic, 8k, looking towards the camera",
        negative_prompt: "",
        category: "woman-studio"
    },
    {
        name: "Park",
        img: "woman-park.jpg",
        prompt: "headshot of {prompt}, park background, in a suit, portrait photo,park background, Half-body digital photo , realistic, highly detailed, photorealistic, 8k, looking towards the camera",
        negative_prompt: "",
        category: "woman-studio",
        hot: true
    },
    {
        name: "Real Estate",
        img: "woman-real-estate.jpg",
        prompt: "headshot of {prompt} as Real Estate Agent, outdoor house background, in a suit, house background, Half-body digital photo , realistic, highly detailed, photorealistic, 8k, looking towards the camera",
        negative_prompt: "",
        category: "woman-studio"
    },
    {
        name: "Cafe",
        img: "woman-cafe.jpg",
        prompt: "headshot of {prompt}, leisure Informal clothing, in cafe background, cafe background, Half-body digital photo , realistic, highly detailed, photorealistic, 8k, looking towards the camera",
        negative_prompt: "",
        category: "woman-studio",
    },
    {
        name: "Bookshelf",
        img: "woman-bokshelf.jpg",
        prompt: "headshot of {prompt}, bookshelf background,bookshelf background, Half-body digital photo , realistic, highly detailed, photorealistic, 8k, looking towards the camera",
        negative_prompt: "",
        category: "woman-studio",
        hot: true
    },
    {
        name: "Yacht",
        img: "woman-yacht.jpg",
        prompt: "headshot of {prompt}, Leisure Informal clothing, with a Yacht background,Yacht background, Half-body digital photo , realistic, highly detailed, photorealistic, 8k, looking towards the camera",
        negative_prompt: "",
        category: "woman-studio"
    },
    {
        name: "Theater",
        img: "woman-theater.jpg",
        prompt: "headshot of {prompt}, Leisure Informal clothing, in a Theater background,Theater background, Half-body digital photo , realistic, highly detailed, photorealistic, 8k, looking towards the camera",
        negative_prompt: "",
        category: "woman-studio",
        isNew: true
    },
    {
        name: "Summer Luxe",
        img: "woman-summer-luxe.jpg",
        prompt: "headshot of {prompt}, leisure Informal clothing, in a Summer Luxe seaside background, seaside background, Half-body digital photo , realistic, highly detailed, photorealistic, 8k, looking towards the camera",
        negative_prompt: "",
        category: "woman-studio",
    },
    {
        name: "Oscars",
        img: "oscar.jpg",
        prompt: "{prompt}, holds the Oscar for Best Actor and actrise on the prestigious stage of the Academy Awards in Hollywood. {prompt} commanding presence, dressed in an elegant black tuxedo, is highlighted as he stands among other renowned actors and actresses. The audience applauds while the bright lights reflect off the golden statue in his hand. With the Hollywood elite surrounding him and a backdrop of shimmering gold, {prompt} takes center stage, the height of his achievement and stature clearly visible.",
        negative_prompt: "",
        category: "man-dream"
    },
    {
        name: "Sailing",
        img: "sailing-friends.jpg",
        prompt: "{prompt}, beams with happiness and pride in a close-up shot, steering a magnificent sailboat on his round-the-world journey. His family and friends gather around, their laughter carried by the breeze. The sunlight sparkles off the ocean’s surface, highlighting the joy and sense of adventure on his face as he enjoys this once-in-a-lifetime moment surrounded by loved ones.",
        negative_prompt: "",
        category: "man-dream"
    },
      {
        name: "Mon",
        img: "moon.jpg",
        prompt: "{prompt}, beams with happiness as he walks on the surface of the moon alongside fellow astronauts. His joyful expression is visible through the clear visor of his spacesuit helmet, reflecting the excitement of this lunar adventure. The barren, rocky moon landscape and the distant Earth in the background create a breathtaking scene of exploration, with {prompt}’s delighted face at the heart of it.",
        negative_prompt: "",
        category: "man-dream"
    },
];

export const domainPath = "https://web.dreambez.com/img";
