import { GoogleGenAI, Type, Chat } from "@google/genai";
import type { GithubProfile, GithubRepo, ResumeAnalysisResult, InsightsData } from "../types";

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export async function analyzeResume(content: string, mimeType: 'application/pdf' | 'text/plain'): Promise<ResumeAnalysisResult> {
  const model = 'gemini-2.5-flash';
  
  const contentPart = mimeType === 'application/pdf'
    ? { inlineData: { mimeType, data: content } }
    : { text: content };

  const prompt = `
    You are an expert resume analysis tool. Your primary task is to meticulously extract and categorize all hyperlinks from the provided resume content.

    The resume content can be a PDF or plain text. For PDFs, you must be able to parse structured data and extract URLs embedded within the text (e.g., the word "GitHub" hyperlinked to a profile).

    Instructions:
    1.  **Comprehensive URL Extraction**: Scan the entire document to find ALL URLs. This includes:
        *   Visible URLs (e.g., "https://github.com/username", "www.linkedin.com/in/username").
        *   Hyperlinks embedded in text. For example, if the text says "Portfolio" but is a hyperlink to "https://my-portfolio.com", you must extract "https://my-portfolio.com".
        *   Treat both visible URLs and hyperlink targets as valid links.
    2.  **Categorization**: Categorize the extracted URLs as follows:
        *   **githubProfileUrl**: The user's main GitHub profile URL (e.g., 'https://github.com/username'). If multiple GitHub links are found, this should only be the main profile, not links to repositories.
        *   **linkedInUrl**: The user's LinkedIn profile URL.
        *   **portfolioUrls**: URLs for personal portfolios, blogs, or personal websites.
        *   **projectUrls**: URLs pointing to specific projects. These can be GitHub repository links, live demo links, etc.
        *   **otherUrls**: Any other URLs that don't fit into the above categories (e.g., certifications, LeetCode/HackerRank profiles).
    3.  **Uniqueness**: Ensure all URLs in the final output are unique. Do not include duplicates across or within categories.

    Provide your response in a strict JSON format according to the provided schema. Do not include any other text, explanations, or markdown formatting outside the JSON object.
  `;
  
  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      githubProfileUrl: {
        type: Type.STRING,
        description: "The user's main GitHub profile URL. Return null if not found.",
      },
      linkedInUrl: {
        type: Type.STRING,
        description: "The user's LinkedIn profile URL. Return null if not found."
      },
      portfolioUrls: {
        type: Type.ARRAY,
        description: "An array of URLs for personal portfolios, blogs, or personal websites.",
        items: { type: Type.STRING }
      },
      projectUrls: {
        type: Type.ARRAY,
        description: "An array of URLs for projects (GitHub repos, live demos, etc.).",
        items: { type: Type.STRING }
      },
      otherUrls: {
        type: Type.ARRAY,
        description: "An array of all other miscellaneous URLs found.",
        items: { type: Type.STRING }
      }
    }
  };

  try {
    const response = await ai.models.generateContent({
      model,
      contents: { parts: [contentPart, { text: prompt }] },
      config: {
        responseMimeType: 'application/json',
        responseSchema,
      }
    });

    const jsonText = response.text.trim();
    // In case the model wraps the response in markdown
    const cleanedJson = jsonText.replace(/^```json\s*|```\s*$/g, '');
    const result: ResumeAnalysisResult = JSON.parse(cleanedJson);
    
    return result;
  } catch (error) {
    console.error("Gemini API Error (Resume Analysis):", error);
    if (error instanceof Error && error.message.includes('json')) {
         throw new Error("The AI model returned an invalid format. Please try again with a different document or text.");
    }
    throw new Error("Failed to analyze the resume with the AI model. The content might be unsupported or the API may be temporarily unavailable.");
  }
}

export async function generateGithubSummary(profile: GithubProfile, repos: GithubRepo[]): Promise<string> {
  const model = 'gemini-2.5-flash';

  const topRepos = repos
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 10)
    .map(repo => `- **${repo.name}** (Lang: ${repo.language || 'N/A'}, Stars: ${repo.stargazers_count}): ${repo.description || 'No description.'}`)
    .join('\n');

  const prompt = `
    You are a professional technical writer and career coach specializing in software development.
    Based on the following GitHub profile data, generate a concise yet comprehensive and professional summary (4-6 sentences) suitable for a resume or LinkedIn profile's "About" section.

    **Instructions:**
    - The tone must be professional, confident, and engaging.
    - Highlight key skills, technologies, and potential areas of expertise inferred from the bio and repository data.
    - For the most notable repositories (e.g., those with high stars or unique concepts), provide a slightly more detailed sentence on what it does or its significance. *Do not just list the repositories.*
    - Synthesize the information into a smooth, narrative summary.
    - Use markdown for formatting. Specifically, use **bold** for key technologies (e.g., **React**, **Python**) and project names, and use *italics* for conceptual highlights or roles (e.g., *full-stack development*, *open-source contributor*).
    - Conclude with a forward-looking statement about the developer's interests or goals if possible to infer.

    **GitHub Profile Data:**
    - Name: ${profile.name || profile.login}
    - Login: @${profile.login}
    - Bio: ${profile.bio || 'Not provided.'}
    - Followers: ${profile.followers}
    - Public Repositories: ${profile.public_repos}
    - Location: ${profile.location || 'Not specified'}

    **Top 10 Repositories (by stars):**
    ${topRepos || 'No public repositories to analyze.'}

    Generate the summary now.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API Error (Summary Generation):", error);
    throw new Error("Failed to generate profile summary. The AI model may be temporarily unavailable.");
  }
}

export async function generateInsightsScores(profile: GithubProfile, repos: GithubRepo[]): Promise<InsightsData> {
  const model = 'gemini-2.5-flash';

  const repoData = repos.slice(0, 20).map(r => ({
    name: r.name,
    stars: r.stargazers_count,
    forks: r.forks_count,
    language: r.language,
    description: r.description,
    updated_at: r.updated_at,
  }));

  const prompt = `
    As an expert GitHub profile analyst, evaluate the provided developer profile and repository data. Your task is to generate a set of scores and justifications based on the user's activity, skills, and community engagement.

    **Analysis Criteria:**
    - **Open Source Contributor:** Evaluate their contributions. High scores for frequent updates, multiple repos, and community engagement (stars/forks). Lower scores for few, old, or personal-only projects.
    - **Full Stack Developer:** Analyze language diversity. High scores for a mix of frontend (JS/TS, React) and backend (Python, Go, Java, Node.js) languages across repos. Lower scores for specialization in one area.
    - **Project Maintainer:** Look for signs of good project management. High scores for well-described repos, recent updates, and consistent activity. Lower scores for abandoned or undescribed projects.
    - **Community Leader:** Assess their influence. High scores for a significant number of followers, and repos with high star/fork counts, suggesting their work is valued by others.

    **Output Instructions:**
    - You MUST provide a response in a strict JSON format matching the schema.
    - Scores must be an integer between 0 and 100.
    - Justifications must be a concise, single sentence explaining the score.
    - Calculate an 'overallScore' which is the average of the four insight scores.

    **Data for Analysis:**
    - Profile:
      - Followers: ${profile.followers}
      - Public Repos: ${profile.public_repos}
      - Bio: ${profile.bio}
      - Account Age (Years): ${((new Date().getTime() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24 * 365)).toFixed(1)}
    - Top Repositories (Sample):
      ${JSON.stringify(repoData, null, 2)}
  `;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
        overallScore: {
            type: Type.INTEGER,
            description: "The average score of all insight categories.",
        },
        insights: {
            type: Type.ARRAY,
            description: "An array of developer skill insights.",
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "Name of the insight category (e.g., 'Open Source Contributor')." },
                    score: { type: Type.INTEGER, description: "The score from 0 to 100." },
                    justification: { type: Type.STRING, description: "A concise, single-sentence justification for the score." }
                },
                required: ["name", "score", "justification"],
            }
        }
    }
  };

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema,
      }
    });

    const jsonText = response.text.trim();
    const cleanedJson = jsonText.replace(/^```json\s*|```\s*$/g, '');
    const result: InsightsData = JSON.parse(cleanedJson);
    return result;
  } catch (error) {
    console.error("Gemini API Error (Insights Scores):", error);
    throw new Error("Failed to generate AI insights. The model may be unavailable or the profile data is invalid.");
  }
}

export function createGeneralChat(): Chat {
  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: 'You are a friendly and helpful assistant knowledgeable about GitHub, software development, and resumes. Keep your answers concise and use markdown for formatting when appropriate.',
    },
  });
}

export function createProfileChat(profile: GithubProfile, repos: GithubRepo[]): Chat {
  const topRepos = repos
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 15)
    .map(repo => ({
      name: repo.name,
      language: repo.language,
      stars: repo.stargazers_count,
      description: repo.description,
    }));

  const profileContext = {
    name: profile.name,
    login: profile.login,
    bio: profile.bio,
    followers: profile.followers,
    public_repos: profile.public_repos,
    top_repositories: topRepos,
  };

  const systemInstruction = `You are an expert AI assistant specialized in analyzing GitHub profiles. 
  You have been provided with the following JSON data for the GitHub user "${profile.name || profile.login}".
  Your answers MUST be based *only* on this data. Do not use external knowledge unless explicitly asked.
  Be helpful, concise, and professional. Use markdown for formatting.

  **GitHub Profile Context:**
  \`\`\`json
  ${JSON.stringify(profileContext, null, 2)}
  \`\`\`
  `;

  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction,
    },
  });
}