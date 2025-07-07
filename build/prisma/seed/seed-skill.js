"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedSkills = seedSkills;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
function seedSkills() {
    return __awaiter(this, void 0, void 0, function* () {
        yield prisma.skill.createMany({
            data: [
                {
                    "name": "JavaScript"
                },
                {
                    "name": "TypeScript"
                },
                {
                    "name": "Python"
                },
                {
                    "name": "Java"
                },
                {
                    "name": "Kotlin"
                },
                {
                    "name": "C"
                },
                {
                    "name": "C++"
                },
                {
                    "name": "C#"
                },
                {
                    "name": "Go"
                },
                {
                    "name": "Rust"
                },
                {
                    "name": "Ruby"
                },
                {
                    "name": "PHP"
                },
                {
                    "name": "Swift"
                },
                {
                    "name": "Objective-C"
                },
                {
                    "name": "Scala"
                },
                {
                    "name": "Dart"
                },
                {
                    "name": "Perl"
                },
                {
                    "name": "Haskell"
                },
                {
                    "name": "Elixir"
                },
                {
                    "name": "R"
                },
                {
                    "name": "HTML"
                },
                {
                    "name": "CSS"
                },
                {
                    "name": "Sass"
                },
                {
                    "name": "Less"
                },
                {
                    "name": "SQL"
                },
                {
                    "name": "GraphQL"
                },
                {
                    "name": "NoSQL"
                },
                {
                    "name": "MongoDB"
                },
                {
                    "name": "PostgreSQL"
                },
                {
                    "name": "MySQL"
                },
                {
                    "name": "MariaDB"
                },
                {
                    "name": "Redis"
                },
                {
                    "name": "SQLite"
                },
                {
                    "name": "Firebase"
                },
                {
                    "name": "DynamoDB"
                },
                {
                    "name": "Oracle"
                },
                {
                    "name": "Express"
                },
                {
                    "name": "NestJS"
                },
                {
                    "name": "Next.js"
                },
                {
                    "name": "Nuxt.js"
                },
                {
                    "name": "React"
                },
                {
                    "name": "Redux"
                },
                {
                    "name": "Recoil"
                },
                {
                    "name": "Vue.js"
                },
                {
                    "name": "Vuex"
                },
                {
                    "name": "Pinia"
                },
                {
                    "name": "Angular"
                },
                {
                    "name": "Svelte"
                },
                {
                    "name": "jQuery"
                },
                {
                    "name": "Bootstrap"
                },
                {
                    "name": "Tailwind CSS"
                },
                {
                    "name": "Node.js"
                },
                {
                    "name": "Deno"
                },
                {
                    "name": "Bun"
                },
                {
                    "name": "Spring"
                },
                {
                    "name": "Spring Boot"
                },
                {
                    "name": "Micronaut"
                },
                {
                    "name": "Flask"
                },
                {
                    "name": "Django"
                },
                {
                    "name": "FastAPI"
                },
                {
                    "name": "Tornado"
                },
                {
                    "name": "Rails"
                },
                {
                    "name": "Sinatra"
                },
                {
                    "name": "Laravel"
                },
                {
                    "name": "Symfony"
                },
                {
                    "name": "ASP.NET"
                },
                {
                    "name": "Blazor"
                },
                {
                    "name": "Unity"
                },
                {
                    "name": "Unreal Engine"
                },
                {
                    "name": "TensorFlow"
                },
                {
                    "name": "PyTorch"
                },
                {
                    "name": "Keras"
                },
                {
                    "name": "OpenCV"
                },
                {
                    "name": "Pandas"
                },
                {
                    "name": "NumPy"
                },
                {
                    "name": "Matplotlib"
                },
                {
                    "name": "Scikit-learn"
                },
                {
                    "name": "Jupyter"
                },
                {
                    "name": "VS Code"
                },
                {
                    "name": "WebStorm"
                },
                {
                    "name": "Eclipse"
                },
                {
                    "name": "IntelliJ IDEA"
                },
                {
                    "name": "Android Studio"
                },
                {
                    "name": "Xcode"
                },
                {
                    "name": "Git"
                },
                {
                    "name": "GitHub"
                },
                {
                    "name": "GitLab"
                },
                {
                    "name": "Bitbucket"
                },
                {
                    "name": "Docker"
                },
                {
                    "name": "Kubernetes"
                },
                {
                    "name": "Terraform"
                },
                {
                    "name": "Ansible"
                },
                {
                    "name": "Jenkins"
                },
                {
                    "name": "Travis CI"
                },
                {
                    "name": "CircleCI"
                },
                {
                    "name": "GitHub Actions"
                },
                {
                    "name": "AWS"
                },
                {
                    "name": "GCP"
                },
                {
                    "name": "Azure"
                },
                {
                    "name": "Vercel"
                },
                {
                    "name": "Netlify"
                },
                {
                    "name": "Heroku"
                },
                {
                    "name": "DigitalOcean"
                },
                {
                    "name": "Slack"
                },
                {
                    "name": "Notion"
                },
                {
                    "name": "Trello"
                },
                {
                    "name": "Figma"
                },
                {
                    "name": "Postman"
                },
                {
                    "name": "Insomnia"
                },
                {
                    "name": "Chrome DevTools"
                },
                {
                    "name": "WebSocket"
                },
                {
                    "name": "REST API"
                },
                {
                    "name": "gRPC"
                },
                {
                    "name": "GraphQL API"
                },
                {
                    "name": "OAuth2"
                },
                {
                    "name": "JWT"
                },
                {
                    "name": "OpenAPI"
                },
                {
                    "name": "Linux"
                },
                {
                    "name": "Ubuntu"
                },
                {
                    "name": "Windows"
                },
                {
                    "name": "macOS"
                },
                {
                    "name": "Nginx"
                },
                {
                    "name": "Apache"
                },
                {
                    "name": "Tomcat"
                },
                {
                    "name": "Webpack"
                },
                {
                    "name": "Vite"
                },
                {
                    "name": "Rollup"
                },
                {
                    "name": "Parcel"
                },
                {
                    "name": "ESLint"
                },
                {
                    "name": "Prettier"
                },
                {
                    "name": "Babel"
                },
                {
                    "name": "TypeORM"
                },
                {
                    "name": "Prisma"
                },
                {
                    "name": "Mongoose"
                },
                {
                    "name": "Sequelize"
                },
                {
                    "name": "Jest"
                },
                {
                    "name": "Mocha"
                },
                {
                    "name": "Chai"
                },
                {
                    "name": "Cypress"
                },
                {
                    "name": "Playwright"
                },
                {
                    "name": "Vitest"
                },
                {
                    "name": "Storybook"
                },
                {
                    "name": "Zustand"
                },
                {
                    "name": "Jotai"
                },
                {
                    "name": "TanStack Query"
                },
                {
                    "name": "Three.js"
                },
                {
                    "name": "React Native"
                },
                {
                    "name": "Expo"
                },
                {
                    "name": "Electron"
                },
                {
                    "name": "Capacitor"
                },
                {
                    "name": "Cordova"
                },
                {
                    "name": "OpenGL"
                },
                {
                    "name": "Vulkan"
                },
                {
                    "name": "Redis"
                },
                {
                    "name": "Memcached"
                },
                {
                    "name": "Elasticsearch"
                },
                {
                    "name": "Algolia"
                },
                {
                    "name": "Meilisearch"
                },
                {
                    "name": "RabbitMQ"
                },
                {
                    "name": "Kafka"
                },
                {
                    "name": "MQTT"
                }
            ],
            skipDuplicates: true
        });
        console.log('✅ Skill seed completed.');
    });
}
