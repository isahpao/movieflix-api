import express from 'express';
import {PrismaClient} from '@prisma/client';

const port = 3000;
const app = express();
const prisma = new PrismaClient();

app.use(express.json());

app.get('/movies', async (req, res) => {
    const movies = await prisma.movie.findMany({
        orderBy: { title: "asc" },
        include: { genres: true, languages: true }
    });
    res.json(movies);
});

app.post("/movies", async (req, res) => {
    const { title, genre_id, language_id, oscar_count, release_date } = req.body;

try {

    const movieWithSameTitle = await prisma.movie.findFirst({
        where: { 
            title: { equals: title, mode: "insensitive" }
        }, 
    });
    if(movieWithSameTitle){
        return res
        .status(409)
        .send({ message: "Movie already exists" }) }

    await prisma.movie.create({
    data: { 
    title, 
    genre_id, 
    language_id, 
    oscar_count, 
    release_date: new Date(release_date)
}
    });
}catch(error){res.status(500).send({message:"Error"});
}

res.status(201).send();
});



app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});