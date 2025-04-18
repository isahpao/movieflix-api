"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_json_1 = __importDefault(require("../swagger.json"));
const port = 3000;
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
app.use(express_1.default.json());
app.use("/docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_json_1.default));
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
        if (movieWithSameTitle) {
            return res
                .status(409)
                .send({ message: "Movie already exists" });
        }
        await prisma.movie.create({
            data: {
                title,
                genre_id,
                language_id,
                oscar_count,
                release_date: new Date(release_date)
            }
        });
    }
    catch (error) {
        res.status(500).send({ message: "Error" });
    }
    res.status(201).send();
});
app.put("/movies/:id", async (req, res) => {
    const id = Number(req.params.id);
    try {
        const movie = await prisma.movie.findUnique({
            where: { id },
        });
        if (!movie) {
            return res.status(404).send({ message: "Filme não encontrado" });
        }
        const data = { ...req.body };
        if (data.release_date) {
            const releaseDateParsed = new Date(data.release_date);
            if (isNaN(Number(releaseDateParsed))) {
                return res.status(400).send({ message: "Data de lançamento inválida" });
            }
            data.release_date = releaseDateParsed;
        }
        await prisma.movie.update({
            where: { id },
            data,
        });
        return res.status(200).send({ message: "Filme atualizado com sucesso" });
    }
    catch (error) {
        console.error("Erro ao atualizar o filme:", error);
        return res.status(500).send({ message: "Falha ao atualizar o registro" });
    }
});
app.delete('/movies/:id', async (req, res) => {
    const id = Number(req.params.id);
    try {
        const movie = await prisma.movie.findUnique({
            where: { id }
        });
        if (!movie) {
            return res.status(404).send({ message: 'Filme não encontrado' });
        }
        await prisma.movie.delete({ where: { id } });
    }
    catch (error) {
        res.status(500).send({ message: 'Falha ao remover o registro' });
    }
    res.status(200).send();
});
app.get("/movies/:genderName", async (req, res) => {
    const { genderName } = req.params;
    try {
        const moviesFilteredByGenderName = await prisma.movie.findMany({
            include: {
                genres: true,
                languages: true,
            },
            where: {
                genres: {
                    name: {
                        equals: genderName,
                        mode: "insensitive",
                    },
                },
            },
        });
        res.status(200).send(moviesFilteredByGenderName);
    }
    catch (error) {
        return res.status(500).send({ message: "Falha ao buscar filmes por gênero" });
    }
});
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
