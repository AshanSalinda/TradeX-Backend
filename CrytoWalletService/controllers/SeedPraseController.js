const dataSource = require("../config/config");
const { shuffle } = require("lodash"); // Import shuffle function from lodash
const seedPhraseRepo = dataSource.getRepository("UserDetail");


const words = [
    "apple",
    "banana",
    "cherry",
    "date",
    "car",
    "fig",
    "grape",
    "bike",
    "kiwi",
    "lemon",
    "mango",
    "phone"
];

const shuffleWords = () => {
    // Shuffle the words array
    const shuffledWords = shuffle(words);
    return shuffledWords.join(','); // Join shuffled words into a single string
};

const getSeedPhraseByUseName = async (req, res) => {
    try {
        const userName = req.params.userName;

        if(!userName) {
            return res.status(400).json({message: "Please fill all the fields"});
        }

        const user = await seedPhraseRepo.findOne({where: {userName}});

        if(!user) {
            return res.status(400).json({message: "Invalid Username"});
        }

        console.log('Seed Phrase:', user.seedPhrase);

        res.status(200).json({seedPhrase: user.seedPhrase});
    } catch (error) {
        console.error('Error fetching seedPhrase:', error);
        res.status(500).json({ message: 'An error occurred. Please try again.'});
    }
};


const checkSimilarities = async (seedPhrase) => {
    // Query the database to check for similarities with shuffledWords
    const similarSeedPhrase = await seedPhraseRepo.findOne({ where: {seedPhrase}});

    return !similarSeedPhrase ? false : true;
};

const getUniqueShuffledWords = async (req, res) => {
    let shuffledWords = shuffleWords();
    let similaritiesFound = await checkSimilarities(shuffledWords);
    while (similaritiesFound) {
        shuffledWords = shuffleWords();
        similaritiesFound = await checkSimilarities(shuffledWords);
    }
    res.json(shuffledWords);
};

const getWords = async (req, res) => {
    res.status(200).json(words);
};

module.exports = {
    getUniqueShuffledWords,
    getSeedPhraseByUseName,
    getWords
};
