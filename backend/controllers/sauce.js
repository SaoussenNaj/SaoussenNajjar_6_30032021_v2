const Sauce = require("../models/Sauce");
const fs = require("fs");

// Create (Ajout d'une sauce)
exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id; //l'id est généré automatiquement, donc on le supprime
  const sauce = new Sauce({
    ...sauceObject,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
    likes: 0,
    dislikes: 0,
    usersLiked: [],
    usersDisliked: [],
  });
  sauce
    .save()
    .then(() => res.status(201).json({ message: "Sauce enregistrée" }))
    .catch((error) => res.status(400).json({ error }));
};

// Delete (Suppression) d'une sauce
exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      const filename = sauce.imageUrl.split("/images/")[1];
      fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: "Sauce supprimée !" }))
          .catch((error) => res.status(400).json({ error }));
      });
    })
    .catch((error) => res.status(500).json({ error }));
};

// Update d'une sauce
exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file
    ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body };
  Sauce.updateOne(
    { _id: req.params.id },
    { ...sauceObject, _id: req.params.id }
  )
    .then(() => res.status(200).json({ message: "Sauce modifiée !" }))
    .catch((error) => res.status(400).json({ error }));
};

// Read(lecture) d'une sauce
exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => res.status(200).json(sauce))
    .catch((error) => res.status(404).json({ error }));
};

// Read(lecture) de toutes les sauces
exports.getAllSauce = (req, res, next) => {
  Sauce.find()
    .then((sauces) => res.status(200).json(sauces))
    .catch((error) => res.status(400).json({ error }));
};

// liker ou disliker une sauce:
exports.postLike = (req, res, next) => {
  // const {userId, like} = req.body; //object destructuring
  const userId = req.body.userId;
  const like = req.body.like;
  const sauceId = req.params.id;

  if (like === 1) {
    // 1- je recupere la sauce de la BD
    Sauce.findOne({ _id: sauceId })
      //on reçoit les caractéristiques de la sauce
      .then((sauce) => {
        sauce.usersLiked.push(userId); //on push le userId dans le tableau usersLiked
        sauce.likes += 1; //On ajoute 1 aux likes déjà présentes
        sauce.save(); //on enregistre dans la BD
        res.status(200).json({ message: "Vous aimez la sauce !" }); //message de response
      })
      .catch((error) => res.status(400).json({ error }));
  }

  if (like === -1) {
    Sauce.findOne({ _id: sauceId })
      .then((sauce) => {
        sauce.usersDisliked.push(userId);
        sauce.dislikes += 1;
        sauce.save();
        res.status(200).json({ message: "Vous n'aimez pas la sauce !" });
      })
      .catch((error) => res.status(400).json({ error }));
  }
  if (like === 0) {
    Sauce.findOne({ _id: sauceId })
      .then((sauce) => {
        //on declare une const hasUserLiked pour chercher dans le tableau si userID existe ou pas
        const hasUserLiked = sauce.usersLiked.find((user) => user === userId);
        if (hasUserLiked) {
          //si userId existe dans le tableau
          // on crée et on retourne avec filter un nv tableau contenant tous les élts du tableau d'origine sans le userId
          sauce.usersLiked = sauce.usersLiked.filter((user) => user != userId);
          //on soustrait 1 du nbre total des likes
          sauce.likes -= 1;
          sauce.save(); //save dans la BD
          return res
            .status(200)
            .json({ message: "Vous avez annulé votre like." });
        }

        const hasUserDisliked = sauce.usersDisliked.find(
          (user) => user === userId
        );
        if (hasUserDisliked) {
          sauce.usersDisliked = sauce.usersDisliked.filter(
            (user) => user != userId
          );
          sauce.dislikes -= 1;
          sauce.save();
          return res
            .status(200)
            .json({ message: "Vous avez annulé votre dislike." });
        }
      })
      .catch((error) => res.status(400).json({ error }));
  }
};
