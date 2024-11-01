## Developers

<a href="https://github.com/IsuruVithanage/TradeX-Web/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=IsuruVithanage/TradeX-Web" />
</a>

---

## Trailer

https://github.com/user-attachments/assets/e335e7a5-f9cd-4b1d-a77d-f08e41147aaa

# TradeX-Web-Backend
TradeX is a simulation trading application that allows all traders to practise their strategies in a risk-free environment.

```
tradex-backend
├─ .gitignore
├─ .idea
│  ├─ .gitignore
│  ├─ dataSources.xml
│  ├─ jsLibraryMappings.xml
│  ├─ misc.xml
│  ├─ modules.xml
│  ├─ TradeX-Web-Backend.iml
│  └─ vcs.xml
├─ .vscode
│  └─ settings.json
├─ apiGateway
│  ├─ config
│  │  └─ models
│  │     └─ application.json
│  │     └─ credentials.json
│  │     └─ users.json
│  │  └─ gateway.config.yml
│  │  └─ sync.config.yml
│  ├─ plugins
│  │  └─ checkRolePlugin
│  │     └─ policies
│  │        └─ checkRole.js
│  │     └─ manifest.js
│  ├─ server.js
│  ├─ package-lock.json
│  ├─ package.json
├─ AdminService
│  ├─ .gitignore
│  ├─ config
│  │  └─ config.js
│  ├─ controllers
│  │  └─ AdminController.js
│  ├─ index.js
│  ├─ models
│  │  └─ Admin.js
│  ├─ package-lock.json
│  ├─ package.json
│  └─ routes
│     └─ AdminRoutes.js
├─ AlertService
│  ├─ .gitignore
│  ├─ .vscode
│  │  └─ settings.json
│  ├─ config
│  │  └─ config.js
│  ├─ controllers
│  │  └─ AlertController.js
│  ├─ index.js
│  ├─ models
│  │  └─ AlertModel.js
│  ├─ package-lock.json
│  ├─ package.json
│  └─ routes
│     └─ AlertRoutes.js
├─ CrytoWalletService
│  ├─ .gitignore
│  ├─ config
│  │  └─ config.js
│  ├─ controllers
│  │  ├─ WalletController.js
│  │  └─ WalletHistoryContrller.js
│  ├─ index.js
│  ├─ models
│  │  ├─ Wallet.js
│  │  └─ WalletHistory.js
│  ├─ package-lock.json
│  ├─ package.json
│  └─ routes
│     ├─ WalletHistoryRoutes.js
│     └─ WalletRoutes.js
├─ EducationalService
│  ├─ .gitignore
│  ├─ config
│  │  └─ config.js
│  ├─ controllers
│  │  └─ EduController.js
│  ├─ index.js
│  ├─ models
│  │  └─ Education.js
│  ├─ package-lock.json
│  ├─ package.json
│  └─ routes
│     └─ EduRoutes.js
├─ ForumService
│  ├─ .gitignore
│  ├─ config
│  │  └─ config.js
│  ├─ controllers
│  │  └─ ForumController.js
│  ├─ index.js
│  ├─ models
│  │  └─ Fourmquestions.js
│  ├─ package-lock.json
│  ├─ package.json
│  └─ routes
│     └─ ForumRoutes.js
├─ NewsService
│  ├─ .gitignore
│  ├─ config
│  │  └─ config.js
│  ├─ controllers
│  │  └─ NewsController.js
│  ├─ index.js
│  ├─ models
│  │  └─ News.js
│  ├─ package-lock.json
│  ├─ package.json
│  └─ routes
│     └─ NewsRoutes.js
├─ package.json
├─ PortfolioService
│  ├─ .gitignore
│  ├─ .vscode
│  │  └─ settings.json
│  ├─ config
│  │  └─ config.js
│  ├─ controllers
│  │  ├─ AssetController.js
│  │  ├─ PortfolioValueController.js
│  │  └─ TransactionHistoryController.js
│  ├─ index.js
│  ├─ models
│  │  ├─ AssetModel.js
│  │  ├─ PortfolioValueModel.js
│  │  └─ TransactionHistoryModel.js
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ routes
│  │  ├─ AssetRoutes.js
│  │  ├─ PortfolioValueRoutes.js
│  │  └─ TransactionHistoryRoutes.js
│  ├─ Scheduler
│  │  └─ scheduler.js
│  ├─ services
│  │  ├─ AssetService.js
│  │  ├─ PortfolioValueService.js
│  │  └─ TransactionHistoryService.js
│  └─ Triggers
│     ├─ checkAndDeleteAssets.js
│     └─ update_portfolio_value_trigger.js
├─ README.md
├─ SimulateTradingService
│  ├─ .gitignore
│  ├─ config
│  │  └─ config.js
│  ├─ controllers
│  │  ├─ OrderController.js
│  │  └─ QuizController.js
│  ├─ index.js
│  ├─ models
│  │  ├─ Order.js
│  │  └─ Question.js
│  ├─ package-lock.json
│  ├─ package.json
│  └─ routes
│     ├─ OrderRoutes.js
│     └─ QuizRoutes.js
├─ UserService
│  ├─ .gitignore
│  ├─ config
│  │  └─ config.js
│  ├─ controllers
│  │  └─ UserController.js
│  ├─ index.js
│  ├─ models
│  │  └─ UserModel.js
│  ├─ package-lock.json
│  ├─ package.json
│  └─ routes
│     └─ UserRoutes.js
└─ WatchListService
   ├─ .gitignore
   ├─ config
   │  └─ config.js
   ├─ controllers
   │  └─ WatchListController.js
   ├─ index.js
   ├─ models
   │  └─ WatchListModel.js
   ├─ package-lock.json
   ├─ package.json
   └─ routes
      └─ WatchListRoutes.js

```
