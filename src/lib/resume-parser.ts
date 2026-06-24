import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { llm } from "./llm";
import { ResumeSchema } from "./Schemas/resume-schema";

const structuredLlm = llm.withStructuredOutput(ResumeSchema);

export async function parseResumePDF(pdf:File) {
    const emptyResult = {
        rawText: "",
        skills: [],
        projects: [],
        experience: [],
        education: [],
    };

    if (!pdf) {
        return emptyResult;
    }
    try {
        const loader = new PDFLoader(pdf);
        const docs = await loader.load();

        console.log(docs);

        const text = docs
        .map((doc) => doc.pageContent)
        .join("\n");

        const result = await structuredLlm.invoke(`
        Extract the following information from this resume:

        - skills
        - projects
        - work experience
        - education

        Resume:

        ${text.slice(0, 15000)}
        `);

        return {
        rawText: text,
        skills: result.skills ?? [],
        projects: result.projects ?? [],
        experience: result.experience ?? [],
        education: result.education ?? [],
        };
    } catch (error) {
        console.error("Error parsing resume PDF:", error);
        return emptyResult;
    }
}