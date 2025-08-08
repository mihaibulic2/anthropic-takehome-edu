[DOC ABOUT THIS PROTOTYPE](https://docs.google.com/document/d/1l-YfHknV9pB_-C_XjYkjND6lWgY7d_2ZNxOQ_Wxoz3o)

## Project Description / Details
- this project is a prototype for a new feature to add to the claude LLM. It's based on a simplified UI (vercel/ai-chatbot fork) for the claude web chat interface for simplicity. Below we describe this prototype
- purpose: when kids try to use claude to get answers to school work or when they're just to get an explanation for some school work, we will show them a small cute pop-up with an educational game that can help teach them the underlying concept instead of just giving them the answer
- why: so kids learn these basic concepts instead of just developing the habit of asking an AI to do their thinking for them
- general mechanism:
  - when the user is asking to solve or explain a K-6th grade math problem, the LLM uses tool calls to see if there is an appropriate game
  - if so, it will present the game to the user via a pop-up
  - if the user clicks the pop-up, the game will launch with custom questions tailored to the topic they asked about (and the appropriate difficulty)
 - once the game runs out of questions, it can retrieve more questions based on the user's performance
 - if the user leaves the game or dismisses the pop-up, the LLM is notified of that (including the users stats if they played)

## Running locally

You will need to use the environment variables [defined in `.env.example`](.env.example) to run Next.js AI Chatbot. It's recommended you use [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables) for this, but a `.env` file is all that is necessary.

> Note: You should not commit your `.env` file or it will expose secrets that will allow others to control access to your various AI and authentication provider accounts.

1. Install Vercel CLI: `npm i -g vercel`
2. Link local instance with Vercel and GitHub accounts (creates `.vercel` directory): `vercel link`
3. Download your environment variables: `vercel env pull`

```bash
pnpm install
pnpm dev
```

Your app template should now be running on [localhost:3000](http://localhost:3000).
