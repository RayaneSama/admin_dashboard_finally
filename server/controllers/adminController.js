const mysql = require("mysql");
const db = require("../config/db");

class Gestionnaire {
  constructor({ nom, prenom, date_naiss_gestio, photo, email, motdepasse }) {
    this.nom = nom;
    this.prenom = prenom;
    this.date_naiss_gestio = date_naiss_gestio;
    this.photo = photo;
    this.email = email;
    this.motdepasse = motdepasse;
  }
}

exports.homepageAdmin = async (req, res) => {
  const locals = {
    title: "Admin",
  };
  res.render("../views/Admin/homepageAdmin", {
    locals,
    layout: "./layouts/mainAdmin.ejs",
  });
};
// la partie de la gestion des Gestionnaires ---------------------------------------------------------------------------
// get gestionnaire data
exports.viewGestionnaire = async (req, res) => {
  const GestionnaireId = req.params.id; // Récupère l'ID du Gestionnaire depuis l'URL
  const locals = {
    title: "Voir Détails",
  };
  // Exécute une requête SQL pour récupérer les détails du Gestionnaire avec l'ID spécifié
  db.query(
    "SELECT id_ge,nom,prenom,date_naiss_gestio,photo_ge,compte.email_co FROM `gestionnaire de club` JOIN compte ON `gestionnaire de club`.id_co_ge = compte.id_co AND id_ge=?;",
    [GestionnaireId],
    (err, result) => {
      if (err) {
        console.error("erreur sql id gestionnaire" + err);
        return res.status(500).send("erreur sql id gestionnaire");
      }
      console.log(result);
      const id = result[0].id_ge;
      res.render("../views/Admin/detailsGestio", {
        locals,
        id,
        result,
        layout: "./layouts/mainAdmin.ejs",
      }); // Rend la vue avec les détails du gestionnaire
    }
  );
};

//get nouveau gestionnaire
exports.addGestionnaire = async (req, res) => {
  const locals = {
    title: "Ajouter un Gestionnaire",
  };
  res.render("../views/Admin/addGestio", {
    locals,
    layout: "./layouts/mainAdmin.ejs",
  });
};

exports.postGestionnaire = async (req, res) => {
  //  console.log(req.body);

  const newGestionnaire = new Gestionnaire({
    nom: req.body.nom,
    prenom: req.body.prenom,
    date_naiss_gestio: req.body.date_naiss_gestio,
    email: req.body.email,
    motdepasse: req.body.motdepasse,
  });
  photo = req.file.filename;
  db.query(
    "INSERT INTO compte (id_type,nom_utilisateur, mot_de_passe, email_co) VALUES (?,?,?,?)",
    [
      6,
      newGestionnaire.nom + " " + newGestionnaire.prenom,
      newGestionnaire.motdepasse,
      newGestionnaire.email,
    ],
    (err, result) => {
      if (err) {
        console.error("erreur creer compte " + err);
        return res
          .status(500)
          .send("erreur sql ajouter compte du Gestionnaire");
      }
      db.query(
        "SELECT id_co FROM compte WHERE email_co =? ",
        [newGestionnaire.email],
        (err, resultid) => {
          //console.log(resultid);
          if (err) {
            console.error("erreur avoir id  compte " + err);
            return res
              .status(500)
              .send("erreur sql avoir id compte du Gestionnaire");
          }
          console.log(req.file.filename);
          db.query(
            "INSERT INTO `gestionnaire de club` (nom, prenom,id_ad_ge,date_naiss_gestio,id_co_ge,photo_ge) VALUES (?,?,?,?,?,?) ",
            [
              newGestionnaire.nom,
              newGestionnaire.prenom,
              2,
              newGestionnaire.date_naiss_gestio,
              resultid[0].id_co,
              req.file.filename,
            ],
            async (err, result) => {
              if (err) {
                console.error("erreur creer gestionnaire" + err);
                return res.status(500).send("erreur sql ajouter gestionnaire");
              }
              console.log(result.insertId);
              await req.flash("info", "Gestionnaire Ajouté !!");
              res.redirect(`/gererGestionnaire`);

              // console.log("joueur ajoute")
              //  console.log("compte cree")
            }
          );
        }
      );
    }
  );
};

exports.supprimerGestionnaire = async (req, res) => {
  db.query(
    "DELETE FROM `gestionnaire de club` WHERE id_ge= ?",
    [req.params.id],
    (err, result) => {
      if (err) {
        console.error("erreur supprimer gestionnaire" + err);
        return res.status(500).send("erreur sql supprimer Gestionnaire");
      }
    }
  );
  await req.flash("info", "Gestionnaire Supprime !!");
  res.redirect(`/gererGestionnaire`);
};

exports.gererGestionnaire = async (req, res) => {
  const messages = await req.flash("info");
  const locals = {
    title: "Gestion des Gestionnaire",
  };
  db.query(
    "SELECT id_ge,nom, prenom,photo_ge,date_naiss_gestio,compte.email_co FROM `gestionnaire de club` JOIN compte ON `gestionnaire de club`.id_co_ge = compte.id_co; ",
    (err, result) => {
      if (err) {
        console.error("erreur sql select data Gestionnaires  " + err);
        return res.status(500).send("erreur sql select data Gestionnaires");
      }

      // console.log(result);

      res.render("AdminIndex", {
        locals,
        messages,
        result,
        layout: "./layouts/mainAdmin.ejs",
      });
    }
  );
};
// get edit Gestionnaire

exports.editGestionnaire = async (req, res) => {
  const userId = req.params.id;
  db.query(
    "SELECT id_ge,nom,prenom,date_naiss_gestio,photo_ge,compte.email_co,mot_de_passe FROM `gestionnaire de club` JOIN compte ON `gestionnaire de club`.id_co_ge = compte.id_co AND id_ge=?",
    [userId],
    (err, result) => {
      if (err) {
        console.error("erreur sql select data Gestionnaires  " + err);
        return res.status(500).send("erreur sql select data Gestionnaires");
      }
      res.render("../views/Admin/modifierGestio", {
        result,
        layout: "./layouts/mainAdmin.ejs",
      });
    }
  );
};
// put edit gestionnaire
exports.editpostGestio = async (req, res) => {
  //console.log(req.params.id);
  if (req.file) {
    photo = req.file.filename;
    db.query(
      "UPDATE `gestionnaire de club` SET nom =?,prenom =?,date_naiss_gestio=?,photo_ge=? WHERE id_ge=?",
      [
        req.body.nom_ge,
        req.body.prenom_ge,
        req.body.date_naiss_gestio,
        photo,
        req.params.id,
      ],
      (err, result) => {
        if (err) {
          console.error("erreur update gestionnaire" + err);
          return res.status(500).send("erreur sql update gestionnaire");
        }
        db.query(
          "SELECT id_co_ge FROM `gestionnaire de club` WHERE id_ge=? ",
          [req.params.id],
          (err, residcoge) => {
            if (err) {
              console.error("erreur update gestionnaire" + err);
              return res.status(500).send("erreur sql update gestionnaire");
            }
            //console.log(residcoge);
            db.query(
              "UPDATE compte SET nom_utilisateur=?,mot_de_passe=?,email_co=? WHERE id_co=?",
              [
                req.body.nom_ge + "" + req.body.prenom_ge,
                req.body.motdepasse_ge,
                req.body.email_ge,
                residcoge[0].id_co_ge,
              ],
              (err, resultcompte) => {
                if (err) {
                  console.error("erreur update gestionnaire" + err);
                  return res.status(500).send("erreur sql update gestionnaire");
                }
              }
            );
          }
        );
      }
    );
  } else {
    db.query(
      "UPDATE `gestionnaire de club` SET nom =?,prenom =?,date_naiss_gestio=? WHERE id_ge=?",
      [
        req.body.nom_ge,
        req.body.prenom_ge,
        req.body.date_naiss_gestio,
        req.params.id,
      ],
      (err, result) => {
        if (err) {
          console.error("erreur update gestionnaire" + err);
          return res.status(500).send("erreur sql update gestionnaire");
        }
        db.query(
          "SELECT id_co_ge FROM `gestionnaire de club` WHERE id_ge=? ",
          [req.params.id],
          (err, residcoge) => {
            if (err) {
              console.error("erreur update gestionnaire" + err);
              return res.status(500).send("erreur sql update gestionnaire");
            }
            //console.log(residcoge);
            db.query(
              "UPDATE compte SET nom_utilisateur=?,mot_de_passe=?,email_co=? WHERE id_co=?",
              [
                req.body.nom_ge + "" + req.body.prenom_ge,
                req.body.motdepasse_ge,
                req.body.email_ge,
                residcoge[0].id_co_ge,
              ],
              (err, resultcompte) => {
                if (err) {
                  console.error("erreur update gestionnaire" + err);
                  return res.status(500).send("erreur sql update gestionnaire");
                }
              }
            );
          }
        );
      }
    );
  }

  await req.flash("info", "Gestionnaire Modifié !!");

  res.redirect(`/gererGestionnaire`);
};
// --------------------------------------------------------------------------------------------
// la partie gestion des Arbitres
class Arbitre {
  constructor({ nom_ar, prenom_ar, poste_ar, email, motdepasse }) {
    this.nom = nom_ar;
    this.prenom = prenom_ar;
    this.poste = poste_ar;
    this.email = email;
    this.motdepasse = motdepasse;
  }
}

exports.viewArbitres = async (req, res) => {
  const ArbitreId = req.params.id; // Récupère l'ID de l'arbitre depuis l'URL
  const locals = {
    title: "Voir Détails",
  };
  // Exécute une requête SQL pour récupérer les détails de l'arbitre avec l'ID spécifié
  db.query(
    "SELECT arb.id_ar, arb.nom_ar, arb.prenom_ar, arb.poste_ar,arb.photo_ar, cpt.email_co FROM arbitre AS arb JOIN compte AS cpt ON arb.id_co_ar = cpt.id_co WHERE arb.id_ar = ?;",
    [ArbitreId],
    (err, result) => {
      if (err) {
        console.error("erreur sql id arbitre" + err);
        return res.status(500).send("erreur sql id arbitre");
      }
      //console.log("Query result:", result); // Log the query result
      if (result.length === 0) {
        return res.status(404).send("Aucun arbitre trouvé avec cet ID");
      }
      const id = result[0].id_ar;
      res.render("../views/Admin/Arbitres/detailsArbitres", {
        locals,
        id,
        result,
        layout: "./layouts/mainAdmin.ejs",
      }); // Rend la vue avec les détails de l'arbitre
    }
  );
};
exports.gererArbitres = async (req, res) => {
  const messages = await req.flash("info");
  const locals = {
    title: "Gestion des arbitres",
  };
  db.query(
    "SELECT id_ar, nom_ar, prenom_ar, compte.email_co,photo_ar FROM arbitre JOIN compte ON arbitre.id_co_ar = compte.id_co",
    (err, result) => {
      if (err) {
        console.error("erreur sql select data arbitres: " + err);
        return res.status(500).send("erreur sql select data arbitres");
      }

      //console.log("Query result:", result);

      res.render("ArbitresIndex", {
        locals,
        messages,
        result,
        layout: "./layouts/mainAdmin.ejs",
      });
    }
  );
};
exports.editArbitre = async (req, res) => {
  const ArbitreId = req.params.id;
  db.query(
    "SELECT id_ar,nom_ar,prenom_ar,poste_ar,compte.email_co,mot_de_passe FROM arbitre JOIN compte ON arbitre.id_co_ar = compte.id_co AND id_ar=?",
    [ArbitreId],
    (err, result) => {
      if (err) {
        console.error("erreur sql select data arbitres  " + err);
        return res.status(500).send("erreur sql select data arbitres");
      }
      res.render("../views/Admin/Arbitres/modifierArbitres", {
        result,
        ArbitreId,
        layout: "./layouts/mainAdmin.ejs",
      });
    }
  );
};

//get nouveau Arbitres
exports.addArbitres = async (req, res) => {
  const locals = {
    title: "Ajouter un Arbitre",
  };
  res.render("../views/Admin/Arbitres/addArbitres", {
    locals,
    layout: "./layouts/mainAdmin.ejs",
  });
};

exports.postArbitres = async (req, res) => {
  //  console.log(req.body);
  photo = req.file.filename;
  const newArbitre = new Arbitre({
    nom_ar: req.body.nom_ar,
    prenom_ar: req.body.prenom_ar,
    poste_ar: req.body.poste,
    photo,
    email_co: req.body.email,
    motdepasse: req.body.motdepasse,
  });

  db.query(
    "INSERT INTO compte (id_type,nom_utilisateur, mot_de_passe, email_co) VALUES (?,?,?,?)",
    [
      4,
      req.body.nom_ar + " " + req.body.prenom_ar,
      req.body.motdepasse,
      req.body.email,
    ],
    (err, result) => {
      if (err) {
        console.error("erreur creer compte " + err);
        return res.status(500).send("erreur sql ajouter compte d'arbitre");
      }
      db.query(
        "SELECT id_co FROM compte WHERE email_co =? ",
        [req.body.email],
        (err, resultid) => {
          console.log(resultid);
          if (err) {
            console.error("erreur avoir id  compte " + err);
            return res.status(500).send("erreur sql avoir id compte d'arbitre");
          }
          // a voir -------------------------------------------------------------------------
          db.query(
            "INSERT INTO arbitre (nom_ar, prenom_ar,poste_ar,photo_ar,id_co_ar) VALUES (?,?,?,?,?) ",
            [
              newArbitre.nom,
              newArbitre.prenom,
              newArbitre.poste,
              photo,
              resultid[0].id_co,
            ],
            async (err, result) => {
              if (err) {
                console.error("erreur creer Arbitre" + err);
                return res.status(500).send("erreur sql ajouter Arbitre");
              }
              console.log(result.insertId);
              await req.flash("info", "Arbitre Ajouté !!");
              res.redirect(`/gererArbitres`);

              // console.log("Arbitre ajoute")
              //  console.log("compte cree")
            }
          );
        }
      );
    }
  );
};
// put edit arbitre
exports.editpostArbitres = async (req, res) => {
  // console.log(req.params.id);
  if (req.file) {
    photo = req.file.filename;
    db.query(
      "UPDATE arbitre SET nom_ar =?,prenom_ar =? ,photo_ar=? WHERE id_ar=?",
      [req.body.nom_ar, req.body.prenom_ar, photo, req.params.id],
      (err, result) => {
        if (err) {
          console.error("erreur update arbitre" + err);
          return res.status(500).send("erreur sql update arbitre");
        }
        db.query(
          "SELECT id_co_ar FROM arbitre WHERE id_ar=? ",
          [req.params.id],
          (err, residcoar) => {
            if (err) {
              console.error("erreur update arbitre" + err);
              return res.status(500).send("erreur sql update arbitre");
            }
            // console.log(residcoar);
            db.query(
              "UPDATE compte SET nom_utilisateur=?,mot_de_passe=?,email_co=? WHERE id_co=?",
              [
                req.body.nom_ar + "" + req.body.prenom_ar,
                req.body.motdepasse_ar,
                req.body.email_ar,
                residcoar[0].id_co_ar,
              ],
              (err, resultcompte) => {
                if (err) {
                  console.error("erreur update arbitre" + err);
                  return res.status(500).send("erreur sql update arbitre");
                }
              }
            );
          }
        );
      }
    );
  } else {
    db.query(
      "UPDATE arbitre SET nom_ar =?,prenom_ar =? WHERE id_ar=?",
      [req.body.nom_ar, req.body.prenom_ar, req.params.id],
      (err, result) => {
        if (err) {
          console.error("erreur update arbitre" + err);
          return res.status(500).send("erreur sql update arbitre");
        }
        db.query(
          "SELECT id_co_ar FROM arbitre WHERE id_ar=? ",
          [req.params.id],
          (err, residcoar) => {
            if (err) {
              console.error("erreur update arbitre" + err);
              return res.status(500).send("erreur sql update arbitre");
            }
            // console.log(residcoar);
            db.query(
              "UPDATE compte SET nom_utilisateur=?,mot_de_passe=?,email_co=? WHERE id_co=?",
              [
                req.body.nom_ar + "" + req.body.prenom_ar,
                req.body.motdepasse_ar,
                req.body.email_ar,
                residcoar[0].id_co_ar,
              ],
              (err, resultcompte) => {
                if (err) {
                  console.error("erreur update arbitre" + err);
                  return res.status(500).send("erreur sql update arbitre");
                }
              }
            );
          }
        );
      }
    );
  }

  await req.flash("info", "Arbitre Modifié !!");

  res.redirect(`/gererArbitres/`);
};
exports.supprimerArbitres = async (req, res) => {
  db.query(
    "DELETE FROM arbitre WHERE id_ar= ?",
    [req.params.id],
    (err, result) => {
      if (err) {
        console.error("erreur supprimer l'arbitre" + err);
        return res.status(500).send("erreur sql supprimer l'arbitre");
      }
    }
  );
  await req.flash("info", "Arbitre Supprime !!");
  res.redirect(`/gererArbitres/`);
};
//-------------------------------------------------------------------------------------------------------
// la partie gestion des stades
class Stades {
  constructor({ nom_std, ville_std, capacite_std, date_crt }) {
    this.nom_std = nom_std;
    this.ville_std = ville_std;
    this.capacite_std = capacite_std;
    this.date_crt = date_crt;
  }
}
exports.viewStades = async (req, res) => {
  const StadeId = req.params.id; // Récupère l'ID de stade depuis l'URL
  const locals = {
    title: "Voir Détails",
  };
  // Exécute une requête SQL pour récupérer les détails du stade avec l'ID spécifié
  db.query(
    "SELECT id_std, nom_std, ville_std, capacite_std, date_crt FROM stade WHERE id_std = ?;",
    [StadeId],
    (err, result) => {
      if (err) {
        console.error("erreur sql id stade" + err);
        return res.status(500).send("erreur sql id stade");
      }
      //console.log("Query result:", result); // Log the query result
      if (result.length === 0) {
        return res.status(404).send("Aucun stade trouvé avec cet ID");
      }
      const id = result[0].id_std;
      res.render("../views/Admin/Stades/detailsStades", {
        locals,
        id,
        result,
        layout: "./layouts/mainAdmin.ejs",
      }); // Rend la vue avec les détails du stade
    }
  );
};
exports.gererStades = async (req, res) => {
  const messages = await req.flash("info");
  const locals = {
    title: "Gestion des Stades",
  };
  db.query("SELECT id_std,nom_std,ville_std FROM stade;", (err, result) => {
    if (err) {
      console.error("erreur sql select data stades: " + err);
      return res.status(500).send("erreur sql select data stades");
    }

    //console.log("Query result:", result);

    if (!result || result.length === 0) {
      return res.status(404).send("Aucun stade trouvé dans la base de données");
    }

    res.render("StadesIndex", {
      locals,
      messages,
      result,
      layout: "./layouts/mainAdmin.ejs",
    });
  });
};
exports.editStades = async (req, res) => {
  const StadesId = req.params.id;
  db.query(
    "SELECT id_std,nom_std,ville_std,capacite_std,date_crt FROM stade where id_std=?",
    [StadesId],
    (err, result) => {
      if (err) {
        console.error("erreur sql select data stades  " + err);
        return res.status(500).send("erreur sql select data stades");
      }
      res.render("../views/Admin/Stades/modifierStades", {
        result,
        StadesId,
        layout: "./layouts/mainAdmin.ejs",
      });
    }
  );
};

//get nouveau Stades
exports.addStades = async (req, res) => {
  const locals = {
    title: "Ajouter un Stade",
  };
  res.render("../views/Admin/Stades/addStades", {
    locals,
    layout: "./layouts/mainAdmin.ejs",
  });
};

exports.postStades = async (req, res) => {
  const newStade = new Stades({
    nom_std: req.body.nom,
    ville_std: req.body.ville,
    capacite_std: req.body.capacite,
    date_crt: req.body.date_de_creation,
  });

  db.query(
    "INSERT INTO stade (nom_std, ville_std, capacite_std, date_crt) VALUES (?, ?, ?, ?)",
    [
      newStade.nom_std,
      newStade.ville_std,
      newStade.capacite_std,
      newStade.date_crt,
    ],
    (err, result) => {
      if (err) {
        console.error("Erreur lors de l'insertion du stade :", err);
        return res.status(500).send("Erreur lors de l'insertion du stade");
      }
      console.log("Nouveau stade inséré avec l'ID :", result.insertId);
      req.flash("info", "Stade ajouté avec succès !");
      res.redirect("/gererStades");
    }
  );
};

exports.supprimerStades = async (req, res) => {
  db.query(
    "DELETE FROM stade WHERE id_std= ?",
    [req.params.id],
    (err, result) => {
      if (err) {
        console.error("erreur supprimer stade" + err);
        return res.status(500).send("erreur sql supprimer stade");
      }
    }
  );
  await req.flash("info", "Stades Supprime !!");
  res.redirect(`/gererStades/`);
};
// put edit Stades
exports.editpostStades = async (req, res) => {
  //console.log(req.params.id);

  db.query(
    "UPDATE stade SET nom_std =?,ville_std =?,capacite_std=?,date_crt=? WHERE id_std=?",
    [
      req.body.nom_stade,
      req.body.ville_stade,
      req.body.capacite_stade,
      req.body.date_de_creation_stade,
      req.params.id,
    ],
    (err, result) => {
      if (err) {
        console.error("erreur update stade" + err);
        return res.status(500).send("erreur sql update stade");
      }
    }
  );

  await req.flash("info", "Stade Modifié !!");

  res.redirect(`/gererStades`);
};

// la partie gestion des articles
class Articles {
  constructor({ date_art, titre_art, description_art, image_art, auteur_art }) {
    this.date_art = date_art;
    this.titre_art = titre_art;
    this.description_art = description_art;
    this.image_art = image_art;
    this.auteur_art = auteur_art;
  }
}
exports.viewArticles = async (req, res) => {
  const ArticleId = req.params.id; // Récupère l'ID de l'article depuis l'URL
  const locals = {
    title: "Voir Détails",
  };
  // Exécute une requête SQL pour récupérer les détails de l'article avec l'ID spécifié
  db.query(
    "SELECT id_art, date_art, titre_art, description_art,image_art,auteur_art FROM article WHERE id_art = ?;",
    [ArticleId],
    (err, result) => {
      if (err) {
        console.error("erreur sql id article" + err);
        return res.status(500).send("erreur sql id article");
      }
      //console.log("Query result:", result); // Log the query result
      if (result.length === 0) {
        return res.status(404).send("Aucun article trouvé avec cet ID");
      }
      const id = result[0].id_art;
      res.render("../views/Admin/Articles/detailsArticles", {
        locals,
        id,
        result,
        layout: "./layouts/mainAdmin.ejs",
      }); // Rend la vue avec les détails de l'article
    }
  );
};
exports.gererArticles = async (req, res) => {
  const messages = await req.flash("info");
  const locals = {
    title: "Gestion des Articles",
  };
  db.query(
    "SELECT id_art,titre_art,auteur_art FROM article;",
    (err, result) => {
      if (err) {
        console.error("erreur sql select data articles: " + err);
        return res.status(500).send("erreur sql select data articles");
      }

      //console.log("Query result:", result);

      if (!result || result.length === 0) {
        return res
          .status(404)
          .send("Aucun article trouvé dans la base de données");
      }

      res.render("ArticlesIndex", {
        locals,
        messages,
        result,
        layout: "./layouts/mainAdmin.ejs",
      });
    }
  );
};
exports.editArticles = async (req, res) => {
  const ArticleId = req.params.id;
  db.query(
    "SELECT id_art, date_art, titre_art, description_art,image_art,auteur_art FROM article where id_art=?",
    [ArticleId],
    (err, result) => {
      if (err) {
        console.error("erreur sql select data stades  " + err);
        return res.status(500).send("erreur sql select data stades");
      }
      res.render("../views/Admin/Articles/modifierArticles", {
        result,
        ArticleId,
        layout: "./layouts/mainAdmin.ejs",
      });
    }
  );
};

//get nouveau Articles
exports.addArticles = async (req, res) => {
  const locals = {
    title: "Ajouter un Article",
  };
  res.render("../views/Admin/Articles/addArticles", {
    locals,
    layout: "./layouts/mainAdmin.ejs",
  });
};

exports.postArticles = async (req, res) => {
  photo = req.file.filename;
  const newArticle = new Articles({
    titre_art: req.body.titre,
    description_art: req.body.description,
    photo,
    date_art: req.body.date,
    auteur_art: req.body.auteur,
  });
  if (req.file) {
    db.query(
      "INSERT INTO article (titre_art, description_art, image_art, date_art,auteur_art) VALUES (?,?,?,?,?)",
      [
        newArticle.titre_art,
        newArticle.description_art,
        photo,
        newArticle.date_art,
        newArticle.auteur_art,
      ],
      (err, result) => {
        if (err) {
          console.error("Erreur lors de l'insertion de l'article :", err);
          return res
            .status(500)
            .send("Erreur lors de l'insertion de l'article");
        }
        console.log("Nouveau article inséré avec l'ID :", result.insertId);
        req.flash("info", "Article ajouté avec succès !");
        res.redirect("/gererArticles");
      }
    );
  } else {
    db.query(
      "INSERT INTO article (titre_art, description_art, date_art,auteur_art) VALUES (?,?,?,?,?)",
      [
        newArticle.titre_art,
        newArticle.description_art,
        newArticle.date_art,
        newArticle.auteur_art,
      ],
      (err, result) => {
        if (err) {
          console.error("Erreur lors de l'insertion de l'article :", err);
          return res
            .status(500)
            .send("Erreur lors de l'insertion de l'article");
        }
        //console.log("Nouveau article inséré avec l'ID :", result.insertId);
        req.flash("info", "Article ajouté avec succès !");
        res.redirect("/gererArticles");
      }
    );
  }
};

exports.supprimerArticles = async (req, res) => {
  db.query(
    "DELETE FROM article WHERE id_art= ?",
    [req.params.id],
    (err, result) => {
      if (err) {
        console.error("erreur supprimer article" + err);
        return res.status(500).send("erreur sql supprimer article");
      }
    }
  );
  await req.flash("info", "Article Supprime !!");
  res.redirect(`/gererArticles/`);
};
// put edit arbitre
exports.editpostArticles = async (req, res) => {
  //console.log(req.params.id);
  if (req.file) {
    photo = req.file.filename;
    console.log(photo);
    db.query(
      "UPDATE article SET titre_art =?,description_art =?,date_art=?,image_art=?,auteur_art=? WHERE id_art=?",
      [
        req.body.titre_article,
        req.body.description_article,
        req.body.date_article,
        photo,
        req.body.auteur_article,
        req.params.id,
      ],
      (err, result) => {
        if (err) {
          console.error("erreur update article" + err);
          return res.status(500).send("erreur sql update article");
        }
      }
    );
  } else {
    db.query(
      "UPDATE article SET titre_art =?,description_art =?,date_art=?,auteur_art=? WHERE id_art=?",
      [
        req.body.titre_article,
        req.body.description_article,
        req.body.date_article,
        req.body.auteur_article,
        req.params.id,
      ],
      (err, result) => {
        if (err) {
          console.error("erreur update article" + err);
          return res.status(500).send("erreur sql update article");
        }
      }
    );
  }

  await req.flash("info", "Article Modifié !!");

  res.redirect(`/gererArticles`);
};

// la partie gestion des matches
class Matches {
  constructor({
    date_ma,
    horaire_ma,
    equipe_1,
    score_eq1,
    equipe_2,
    score_eq2,
    carton_j_ma,
    carton_r_ma,
    homme_ma,
    id_ge_ma,
    id_std_ma,
    id_journee_ma,
  }) {
    this.date_ma = date_ma;
    this.horaire_ma = horaire_ma;
    this.equipe_1 = equipe_1;
    this.score_eq1 = score_eq1;
    this.equipe_2 = equipe_2;
    this.score_eq2 = score_eq2;
    this.carton_j_ma = carton_j_ma;
    this.carton_r_ma = carton_r_ma;
    this.homme_ma = homme_ma;
    this.id_ge_ma = id_ge_ma;
    this.id_std_ma = id_std_ma;
    this.id_journee_ma = id_journee_ma;
  }
}
exports.viewMatches = async (req, res) => {
  const MatchId = req.params.id; // Récupère l'ID du match depuis l'URL
  const locals = {
    title: "Voir Détails",
  };
  // Exécute une requête SQL pour récupérer les détails du match avec l'ID spécifié
  db.query(
    `SELECT m.id_ma, m.date_ma, m.horaire_ma, m.equipe_1, m.equipe_2, m.id_ge_ma, m.id_std_ma, m.journee_ma,
    g.nom AS gestionnaire_nom, g.prenom AS gestionnaire_prenom,
    s.nom_std AS stade_nom, s.ville_std AS stade_ville, s.adresse_std AS stade_adresse, s.capacite_std AS stade_capacite, s.img_std AS stade_img, s.date_crt AS stade_date_crt, s.id_eq_std AS stade_id_equipe
    FROM \`match\` m
    JOIN \`gestionnaire de club\` g ON m.id_ge_ma = g.id_ge
    JOIN \`stade\` s ON m.id_std_ma = s.id_std
    WHERE m.id_ma = ?`,
    [MatchId],
    (err, result) => {
      if (err) {
        console.error("erreur sql id match" + err);
        return res.status(500).send("erreur sql id match");
      }
      //console.log("Query result:", result); // Log the query result
      if (result.length === 0) {
        return res.status(404).send("Aucun match trouvé avec cet ID");
      }
      const id = result[0].id_art;
      res.render("../views/Admin/Matches/detailsMatches", {
        locals,
        id,
        result,
        layout: "./layouts/mainAdmin.ejs",
      }); // Rend la vue avec les détails du match
    }
  );
};

exports.gererMatches = async (req, res) => {
  const messages = await req.flash("info");
  const locals = {
    title: "Gestion des Matches",
  };
  db.query(
    "SELECT id_ma, equipe_1, equipe_2, date_ma FROM `match`;",
    (err, result) => {
      if (err) {
        console.error("erreur sql select data matches: " + err);
        return res.status(500).send("erreur sql select data matches");
      }

      //console.log("Query result:", result);

      res.render("MatchesIndex", {
        locals,
        messages,
        result,
        layout: "./layouts/mainAdmin.ejs",
      });
    }
  );
};
exports.editMatches = async (req, res) => {
  const MatchId = req.params.id;
  db.query(
    "SELECT id_ma, date_ma, horaire_ma, equipe_1, score_eq1, equipe_2, score_eq2, carton_j_ma, carton_r_ma, homme_ma FROM `match` WHERE id_ma = ?;",
    [MatchId],
    (err, result) => {
      if (err) {
        console.error("erreur sql select data matches  " + err);
        return res.status(500).send("erreur sql select data matches");
      }
      res.render("../views/Admin/Matches/modifierMatches", {
        result,
        MatchId,
        layout: "./layouts/mainAdmin.ejs",
      });
    }
  );
};

//get nouveau Matches
exports.addMatches = async (req, res) => {
  const locals = {
    title: "Ajouter un Match",
  };
  db.query("select nom_eq from equipe", (err, result) => {
    if (err) console.log("Erreur");
    //console.log(result);
    res.render("../views/Admin/Matches/addMatches", {
      locals,
      layout: "./layouts/mainAdmin.ejs",
      result,
    });
  });
};

exports.postMatches = async (req, res) => {
  const newMatch = new Matches({
    equipe_1: req.body.equipe_1_match,
    score_eq1: req.body.score_equipe_1_match,
    equipe_2: req.body.equipe_2_match,
    score_eq2: req.body.score_equipe_2_match,
    date_ma: req.body.date_ma_match,
    carton_j_ma: req.body.carton_j_ma_match,
    carton_r_ma: req.body.carton_r_ma_match,
    homme_ma: req.body.homme_ma_match,
  });

  db.query(
    "INSERT INTO `match` (equipe_1, score_eq1, equipe_2, score_eq2,date_ma,carton_j_ma,carton_r_ma,homme_ma) VALUES (?, ?,?,?,?,?,?,?)",
    [
      newMatch.equipe_1,
      newMatch.score_eq1,
      newMatch.equipe_2,
      newMatch.score_eq2,
      newMatch.date_ma,
      newMatch.carton_j_ma,
      newMatch.carton_r_ma,
      newMatch.homme_ma,
    ],
    (err, result) => {
      if (err) {
        console.error("Erreur lors de l'insertion du match :", err);
        return res.status(500).send("Erreur lors de l'insertion du match");
      }
      //console.log("Nouveau match inséré avec l'ID :", result.insertId);
      req.flash("info", "Match ajouté avec succès !");
      res.redirect("/gererMatches");
    }
  );
};

exports.supprimerMatches = async (req, res) => {
  db.query(
    "DELETE FROM match WHERE id_ma= ?",
    [req.params.id],
    (err, result) => {
      if (err) {
        console.error("erreur supprimer match" + err);
        return res.status(500).send("erreur sql supprimer match");
      }
    }
  );
  await req.flash("info", "Match Supprime !!");
  res.redirect(`/gererMatches/`);
};
// put edit match
exports.editpostMatches = async (req, res) => {
  //console.log(req.params.id);

  db.query(
    "UPDATE `match` SET equipe_1 =?,score_eq1 =?,equipe_2=?,score_eq2=?,date_ma=?,carton_j_ma=?,carton_r_ma=?,homme_ma=? WHERE id_ma=?",
    [
      req.body.equipe_1_match,
      req.body.score_equipe_1_match,
      req.body.equipe_2_match,
      req.body.score_equipe_2_match,
      req.body.date_ma_match,
      req.body.carton_j_ma_match,
      req.body.carton_r_ma_match,
      req.body.homme_ma_match,
      req.params.id,
    ],
    (err, result) => {
      if (err) {
        console.error("erreur update match" + err);
        return res.status(500).send("erreur sql update match");
      }
    }
  );

  await req.flash("info", "Match Modifié !!");

  res.redirect(`/gererMatches`);
};

//la partie des equipes
exports.viewEquipes = async (req, res) => {
  const EquipeId = req.params.id; // Récupère l'ID de l'equipe depuis l'URL
  const locals = {
    title: "Voir Détails",
  };
  // Exécute une requête SQL pour récupérer les détails de l'equipe avec l'ID spécifié
  db.query(
    "SELECT id_eq,nom_eq,logo_eq,abre_eq,date_eq,ville_eq FROM equipe WHERE id_eq = ?;",
    [EquipeId],
    (err, result) => {
      if (err) {
        console.error("erreur sql id equipe" + err);
        return res.status(500).send("erreur sql id equipe");
      }
      //console.log("Query result:", result); // Log the query result
      const id = result[0].id_eq;
      res.render("../views/Admin/Equipes/detailsEquipes", {
        locals,
        id,
        result,
        layout: "./layouts/mainAdmin.ejs",
      }); // Rend la vue avec les détails de l'equipe
    }
  );
};
exports.gererEquipes = async (req, res) => {
  const messages = await req.flash("info");
  const locals = {
    title: "Gestion des Equipes",
  };
  db.query("SELECT id_eq, nom_eq, logo_eq FROM equipe;", (err, result) => {
    if (err) {
      console.error("erreur sql select data equipes: " + err);
      return res.status(500).send("erreur sql select data equipes");
    }
    //console.log("Query result:", result);

    res.render("EquipesIndex", {
      locals,
      messages,
      result,
      layout: "./layouts/mainAdmin.ejs",
    });
  });
};
exports.editEquipes = async (req, res) => {
  const EquipeId = req.params.id;
  db.query(
    "SELECT id_eq, nom_eq, abre_eq, logo_eq,ville_eq,date_eq FROM equipe where id_eq=?",
    [EquipeId],
    (err, result) => {
      if (err) {
        console.error("erreur sql select data equipe  " + err);
        return res.status(500).send("erreur sql select data equipes");
      }
      res.render("../views/Admin/Equipes/modifierEquipes", {
        result,
        EquipeId,
        layout: "./layouts/mainAdmin.ejs",
      });
    }
  );
};

//get nouveau Equipes
exports.addEquipes = async (req, res) => {
  const locals = {
    title: "Ajouter une Equipe",
  };

  db.query(
    "SELECT e.id_eq, e.nom_eq, e.abre_eq, e.logo_eq, e.date_eq, e.ville_eq, e.m_gagner_eq, e.m_nul_eq, e.m_perdu_eq, e.nbr_but_p_eq, e.nbr_but_c_eq, e.points_eq, e.diff_eq, e.observation_eq, e.titres_remp_eq, e.id_ge_eq, e.id_dev_eq, e.id_co_ge_eq, g.nom AS gestionnaire_nom, g.prenom AS gestionnaire_prenom FROM equipe e JOIN `gestionnaire de club` g ON e.id_ge_eq = g.id_ge;",
    (err, result) => {
      if (err) {
        console.error("erreur sql select data gestionnaires  " + err);
        return res.status(500).send("erreur sql select data gestionnaire");
      }

      res.render("../views/Admin/Equipes/addEquipes", {
        locals,
        result,
        layout: "./layouts/mainAdmin.ejs",
      });
    }
  );
};

exports.postEquipes = async (req, res) => {
  photo = req.file.filename;
  if (req.file) {
    db.query(
      "INSERT INTO equipe (nom_eq,abre_eq,logo_eq,ville_eq,date_eq) VALUES (?,?,?,?,?)",
      [
        req.body.nom,
        req.body.abreviation,
        photo,
        req.body.ville,
        req.body.date_de_creation,
      ],
      (err, result) => {
        if (err) {
          console.error("Erreur lors de l'insertion de l'equipe :", err);
          return res.status(500).send("Erreur lors de l'insertion de l'equipe");
        }
        //console.log("Nouvelle equipe inséré avec l'ID :", result.insertId);
        req.flash("info", "Equipe ajouté avec succès !");
        res.redirect("/gererEquipes");
      }
    );
  } else {
    db.query(
      "INSERT INTO equipe (nom_eq,abre_eq,ville_eq,date_eq) VALUES (?,?,?,?,?)",
      [
        req.body.nom,
        req.body.abreviation,
        req.body.ville,
        req.body.date_de_creation,
      ],
      (err, result) => {
        if (err) {
          console.error("Erreur lors de l'insertion de l'equipe :", err);
          return res.status(500).send("Erreur lors de l'insertion de l'equipe");
        }
        //console.log("Nouvelle equipe inséré avec l'ID :", result.insertId);
        req.flash("info", "Equipe ajouté avec succès !");
        res.redirect("/gererEquipes");
      }
    );
  }
};

exports.supprimerEquipes = async (req, res) => {
  db.query(
    "DELETE FROM equipe WHERE id_eq= ?",
    [req.params.id],
    (err, result) => {
      if (err) {
        console.error("erreur supprimer equipe" + err);
        return res.status(500).send("erreur sql supprimer equipe");
      }
    }
  );
  await req.flash("info", "Equipe Supprime !!");
  res.redirect(`/gererEquipes/`);
};
// put edit equipes
exports.editpostEquipes = async (req, res) => {
  //console.log(req.params.id);
  if (req.file) {
    photo = req.file.filename;
    db.query(
      "UPDATE equipe SET nom_eq=?,abre_eq=?,logo_eq=?,ville_eq=?,date_eq=? WHERE id_eq=?",
      [
        req.body.nom_equipe,
        req.body.abreviation_equipe,
        photo,
        req.body.ville_equipe,
        req.body.date_de_creation_equipe,
        req.params.id,
      ],
      (err, result) => {
        if (err) {
          console.error("erreur update article" + err);
          return res.status(500).send("erreur sql update article");
        }
      }
    );
  } else {
    db.query(
      "UPDATE equipe SET nom_eq=?,abre_eq=?,ville_eq=?,date_eq=? WHERE id_eq=?",
      [
        req.body.nom_equipe,
        req.body.abreviation_equipe,
        req.body.ville_equipe,
        req.body.date_de_creation_equipe,
        req.params.id,
      ],
      (err, result) => {
        if (err) {
          console.error("erreur update equipe" + err);
          return res.status(500).send("erreur sql update equipes");
        }
      }
    );
  }

  await req.flash("info", "Equipe Modifié !!");

  res.redirect(`/gererEquipes`);
};

//-----------------------------------------------------------------------------------------------------------------------

// la partie profile this need to be fixed
exports.monprofile = async (req, res) => {
  const message_err = await req.flash("info");
  const message_scc = await req.flash("info1");
  const locals = {
    title: "Mon profile",
  };
  db.query(
    "SELECT nom_utilisateur,email_co,photo_profil FROM compte WHERE id_co=?",
    [2],
    (err, result) => {
      if (err) {
        console.error("erreur sql page profile  " + err);
        return res.status(500).send("erreur sql page profile ");
      }
      res.render("../views/Admin/profileAdmin", {
        locals,
        result,
        message_err,
        message_scc,
        layout: "./layouts/mainAdmin.ejs",
      });
    }
  );
};
exports.monprofilepost = async (req, res) => {
  const mdpactuel = req.body.mdpactuel;
  const nvmdp = req.body.nvmdp;

  const locals = {
    title: "Mon profile",
  };

  // Store the response object outside the MySQL query callback
  const response = res;

  db.query(
    "SELECT mot_de_passe, photo_profil FROM compte WHERE id_co=?",
    [2],
    (err, result) => {
      if (err) {
        console.error("erreur sql avoir mdp   " + err);
        return response.status(500).send("erreur sql avoir mdp ");
      }

      // Check if current password matches
      if (mdpactuel === result[0].mot_de_passe && !req.file) {
        // If current password matches and no file (profile picture) is uploaded
        photo_admin = result[0].photo_profil;
        // Update password
        db.query(
          "UPDATE compte SET mot_de_passe=?,photo_profil=? WHERE id_co=?",
          [nvmdp, photo_admin, 2],
          (err, results) => {
            if (err) {
              console.error("erreur sql changer mdp   " + err);
              return response.status(500).send("erreur sql changer mdp ");
            } else {
              req.flash("info1", "Mot de passe changé avec succès");
              return response.redirect(`/monprofile`);
            }
          }
        );
      } else if (!req.body.mdpactuel && !req.file) {
        // If neither the current password nor the file (profile picture) is updated

        return response.redirect(`/monprofile`);
      } else if (!req.body.mdpactuel && req.file) {
        // If only the profile picture is being changed
        photo_admin = req.file.filename;
        db.query(
          "UPDATE compte SET photo_profil=? WHERE id_co=?",
          [photo_admin, 2],
          (err, res) => {
            if (err) {
              console.error("erreur sql changer pfp   " + err);
              return response.status(500).send("erreur sql changer pfp ");
            }
            return response.redirect(`/monprofile`);
          }
        );
      } else {
        // If the current password is incorrect
        req.flash("info", "Mot de passe actuel est faux");
        return response.redirect(`/monprofile`);
      }
    }
  );
};
