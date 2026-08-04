import "dotenv/config";
import { PrismaClient, Platform, AppStatus, CreditTransactionType } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

const daysAgo = (n: number) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);

async function main() {
  console.log("Nettoyage de la base...");
  await prisma.report.deleteMany();
  await prisma.bugEntry.deleteMany();
  await prisma.creditTransaction.deleteMany();
  await prisma.testReport.deleteMany();
  await prisma.app.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  console.log("Création des utilisateurs...");
  const [alice, bilal, chloe, dan, eva] = await Promise.all([
    prisma.user.create({
      data: {
        name: "Alice Martin",
        email: "alice@example.com",
        school: "EPITA",
        techStack: ["React", "Next.js", "TypeScript"],
        portfolioUrl: "https://github.com/alice",
      },
    }),
    prisma.user.create({
      data: {
        name: "Bilal Nasri",
        email: "bilal@example.com",
        school: "42 Paris",
        techStack: ["Flutter", "Dart", "Firebase"],
        portfolioUrl: "https://github.com/bilal",
      },
    }),
    prisma.user.create({
      data: {
        name: "Chloé Dubois",
        email: "chloe@example.com",
        school: "Epitech",
        techStack: ["React Native", "Node.js"],
      },
    }),
    prisma.user.create({
      data: {
        name: "Dan Okafor",
        email: "dan@example.com",
        school: "Université Paris-Saclay",
        techStack: ["Swift", "SwiftUI"],
      },
    }),
    prisma.user.create({
      data: {
        name: "Eva Rossi",
        email: "eva@example.com",
        school: "Autodidacte",
        techStack: ["Django", "Python", "Vue"],
      },
    }),
  ]);

  for (const user of [alice, bilal, chloe, dan, eva]) {
    await prisma.creditTransaction.create({
      data: {
        userId: user.id,
        amount: 3,
        type: CreditTransactionType.WELCOME_BONUS,
        description: "Crédit de bienvenue",
      },
    });
  }

  console.log("Création des apps...");

  const staleApp = await prisma.app.create({
    data: {
      name: "StudyBuddy",
      description:
        "Une app de révision collaborative avec fiches partagées et quiz générés automatiquement.",
      accessUrl: "https://studybuddy.example.com",
      platform: Platform.WEB,
      techStack: ["React", "Next.js", "TypeScript"],
      feedbackFocus: "L'onboarding est-il clair pour un nouvel utilisateur ?",
      feedbackTags: ["Onboarding", "UX"],
      status: AppStatus.WAITING_TESTERS,
      ownerId: alice.id,
      createdAt: daysAgo(8),
    },
  });

  const freshApp = await prisma.app.create({
    data: {
      name: "FitTrack Mobile",
      description:
        "Suivi d'entraînements sportifs avec plans personnalisés et statistiques de progression.",
      accessUrl: "https://testflight.apple.com/join/fittrack",
      platform: Platform.IOS,
      techStack: ["Swift", "SwiftUI"],
      feedbackFocus: "Les statistiques de progression sont-elles compréhensibles ?",
      feedbackTags: ["UX", "Performance"],
      status: AppStatus.WAITING_TESTERS,
      ownerId: dan.id,
      createdAt: daysAgo(1),
    },
  });

  const inTestingApp = await prisma.app.create({
    data: {
      name: "CampusMarket",
      description:
        "Petites annonces entre étudiants d'un même campus : livres, matériel, covoiturage.",
      accessUrl: "https://play.google.com/store/apps/details?id=campusmarket",
      platform: Platform.ANDROID,
      techStack: ["Flutter", "Dart", "Firebase"],
      feedbackFocus: "Le flow de publication d'une annonce est-il fluide ?",
      feedbackTags: ["UX", "Bugs", "Onboarding"],
      status: AppStatus.IN_TESTING,
      ownerId: bilal.id,
      createdAt: daysAgo(3),
    },
  });

  const closedApp = await prisma.app.create({
    data: {
      name: "RecipeShare",
      description: "Partage de recettes entre amis avec liste de courses générée.",
      accessUrl: "https://recipeshare.example.com",
      platform: Platform.WEB,
      techStack: ["Vue", "Django", "Python"],
      feedbackFocus: "La génération de liste de courses fonctionne-t-elle bien ?",
      feedbackTags: ["Bugs", "Performance"],
      status: AppStatus.CLOSED,
      closedAt: daysAgo(1),
      ownerId: eva.id,
      createdAt: daysAgo(12),
    },
  });

  await prisma.app.create({
    data: {
      name: "TaskFlow",
      description: "Gestion de tâches en équipe façon Kanban, pensée pour les projets étudiants.",
      accessUrl: "https://taskflow.example.com",
      platform: Platform.WEB,
      techStack: ["React", "Node.js"],
      feedbackFocus: "La création et le déplacement des cartes sont-ils intuitifs ?",
      feedbackTags: ["UX", "Design"],
      status: AppStatus.WAITING_TESTERS,
      ownerId: chloe.id,
      createdAt: daysAgo(2),
    },
  });

  console.log("Création des rapports de test...");

  const report1 = await prisma.testReport.create({
    data: {
      appId: inTestingApp.id,
      testerId: chloe.id,
      onboardingClarity: 4,
      navigationEase: 5,
      stabilityBugs: 3,
      perceivedDesign: 4,
      strengths: "Interface claire, la recherche d'annonces est rapide et efficace.",
      improvements: "Le formulaire de publication pourrait avoir moins d'étapes.",
      timeSpentMinutes: 18,
      markedUseful: true,
      bugs: {
        create: [
          {
            title: "Crash à l'upload de plusieurs photos",
            description:
              "L'app plante quand on essaie d'ajouter plus de 4 photos à une annonce.",
          },
        ],
      },
    },
  });
  await prisma.creditTransaction.create({
    data: {
      userId: chloe.id,
      amount: 1,
      type: CreditTransactionType.EARNED_TEST_REPORT,
      description: `Test de l'app "${inTestingApp.name}"`,
      relatedAppId: inTestingApp.id,
      relatedTestReportId: report1.id,
    },
  });

  const report2 = await prisma.testReport.create({
    data: {
      appId: closedApp.id,
      testerId: alice.id,
      onboardingClarity: 5,
      navigationEase: 4,
      stabilityBugs: 4,
      perceivedDesign: 5,
      strengths: "Design très soigné, la liste de courses est générée instantanément.",
      improvements: "Manque un mode hors-ligne pour consulter ses recettes.",
      timeSpentMinutes: 12,
      bugs: { create: [] },
    },
  });
  await prisma.creditTransaction.create({
    data: {
      userId: alice.id,
      amount: 1,
      type: CreditTransactionType.EARNED_TEST_REPORT,
      description: `Test de l'app "${closedApp.name}"`,
      relatedAppId: closedApp.id,
      relatedTestReportId: report2.id,
    },
  });

  console.log("Enregistrement des dépenses de publication...");
  for (const app of [staleApp, freshApp, inTestingApp, closedApp]) {
    await prisma.creditTransaction.create({
      data: {
        userId: app.ownerId,
        amount: -1,
        type: CreditTransactionType.SPENT_APP_PUBLISH,
        description: `Publication de l'app "${app.name}"`,
        relatedAppId: app.id,
      },
    });
  }

  console.log("Réconciliation des soldes de crédits...");
  for (const user of [alice, bilal, chloe, dan, eva]) {
    const { _sum } = await prisma.creditTransaction.aggregate({
      where: { userId: user.id },
      _sum: { amount: true },
    });
    await prisma.user.update({
      where: { id: user.id },
      data: { creditBalance: _sum.amount ?? 0 },
    });
  }

  console.log("Seed terminé.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
