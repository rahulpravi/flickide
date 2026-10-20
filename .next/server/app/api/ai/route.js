"use strict";(()=>{var e={};e.id=252,e.ids=[252],e.modules={399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},6002:(e,t,o)=>{o.r(t),o.d(t,{originalPathname:()=>m,patchFetch:()=>f,requestAsyncStorage:()=>u,routeModule:()=>c,serverHooks:()=>g,staticGenerationAsyncStorage:()=>h});var r={};o.r(r),o.d(r,{POST:()=>d});var a=o(9303),i=o(8716),n=o(670);let s=`You are an expert AI software engineer and autonomous agentic coding assistant inside FlickIDE, a modern web and mobile IDE.

You have DIRECT CAPABILITIES to create and manage files and folders in the user's project file system.

### AUTONOMOUS FILE & FOLDER ACTIONS:
When asked to write code, create components, start a project, add features, or generate files/folders, you MUST use the following XML action tags instead of only outputting code in markdown:

1. Creating or Writing a File:
Use the <create_file> tag with the relative file path. Put the complete, production-ready code directly inside the tag:
<create_file path="folder/index.html">
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>App</title>
</head>
<body>
  <h1>Hello FlickIDE</h1>
</body>
</html>
</create_file>

2. Creating a Folder:
Use the <create_folder> tag with the relative folder path:
<create_folder path="new_folder" />

### CRITICAL RULES:
- Relative Paths: Always provide paths relative to the project root (e.g., "index.html", "src/App.tsx", "components/Button.jsx", "styles/theme.css"). Do NOT include leading slashes.
- Raw Code: Put the raw, unescaped code directly inside <create_file>. Do NOT wrap the code in markdown code blocks (\`\`\`) inside the <create_file> tag.
- No Truncation: Provide complete, runnable, production-ready code. Never write placeholders like "// rest of code goes here" or "/* TODO */".
- Multiple Files: You can output multiple <create_file> and <create_folder> tags in a single response when creating full features, components, or projects.
- Conversational Explanations: You may provide brief, helpful explanations before or after the action tags to guide the user on what you built.
- Conceptual Inquiries: For purely theoretical questions (e.g., "Explain how React reconciliation works"), reply using standard markdown without action tags.`,l={gemini:{id:"gemini",name:"Google Gemini",defaultModel:"gemini-2.5-flash",keyUrl:"https://aistudio.google.com/app/apikey",placeholder:"AIzaSy...",badge:"Free Tier",badgeColor:"text-blue-400 bg-blue-500/10 border-blue-500/30"},openai:{id:"openai",name:"ChatGPT (OpenAI)",defaultModel:"gpt-4o-mini",keyUrl:"https://platform.openai.com/api-keys",placeholder:"sk-proj-...",badge:"Industry Std",badgeColor:"text-emerald-400 bg-emerald-500/10 border-emerald-500/30"},grok:{id:"grok",name:"Grok (xAI)",defaultModel:"grok-2-latest",keyUrl:"https://console.x.ai/",placeholder:"xai-...",badge:"Coding Beast",badgeColor:"text-neutral-200 bg-neutral-700/50 border-neutral-600"},groq:{id:"groq",name:"Groq (Ultra Fast / Free)",defaultModel:"llama-3.3-70b-versatile",keyUrl:"https://console.groq.com/keys",placeholder:"gsk_...",badge:"Free & Fast",badgeColor:"text-amber-400 bg-amber-500/10 border-amber-500/30"},openrouter:{id:"openrouter",name:"OpenRouter (All-in-One)",defaultModel:"deepseek/deepseek-chat",keyUrl:"https://openrouter.ai/keys",placeholder:"sk-or-v1-...",badge:"All Models",badgeColor:"text-purple-400 bg-purple-500/10 border-purple-500/30"}};async function p(e,t,o,r=s,a){let i=a?.trim()||l[e]?.defaultModel||"gemini-2.5-flash";if("gemini"===e){let e=`https://generativelanguage.googleapis.com/v1beta/models/${i}:generateContent?key=${t}`,a=await fetch(e,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({system_instruction:{parts:[{text:r}]},contents:[{parts:[{text:o}]}]})}),n=await a.json();if(!a.ok)throw Error(n?.error?.message||"Gemini API Error");return n.candidates?.[0]?.content?.parts?.[0]?.text||"No response"}let n=await fetch({openai:"https://api.openai.com/v1/chat/completions",grok:"https://api.x.ai/v1/chat/completions",groq:"https://api.groq.com/openai/v1/chat/completions",openrouter:"https://openrouter.ai/api/v1/chat/completions"}[e],{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${t}`},body:JSON.stringify({model:i,messages:[{role:"system",content:r},{role:"user",content:o}],temperature:.3})}),p=await n.json();if(!n.ok)throw Error(p?.error?.message||`${e} API Error`);return p.choices?.[0]?.message?.content||"No response"}async function d(e){try{let{provider:t,apiKey:o,model:r,prompt:a,contextFile:i}=await e.json().catch(()=>({}));if(!t||!o||!a)return new Response(JSON.stringify({error:"Missing required parameters: provider, apiKey, or prompt"}),{status:400,headers:{"Content-Type":"application/json"}});let n=i?`

--- ACTIVE FILE CONTEXT (${i.filename}) ---
${i.content}
--- END CONTEXT ---
`:"",s=`${a}${n}`,l=await p(t,o,s,void 0,r);return new Response(JSON.stringify({reply:l}),{status:200,headers:{"Content-Type":"application/json"}})}catch(t){let e=/429|rate|quota/i.test(t?.message)?429:/401|403|unauthoriz|invalid/i.test(t?.message)?401:500;return new Response(JSON.stringify({error:t?.message||"Internal Server Error in AI Proxy"}),{status:e,headers:{"Content-Type":"application/json"}})}}let c=new a.AppRouteRouteModule({definition:{kind:i.x.APP_ROUTE,page:"/api/ai/route",pathname:"/api/ai",filename:"route",bundlePath:"app/api/ai/route"},resolvedPagePath:"C:\\Users\\user\\Desktop\\FlickIDE\\app\\api\\ai\\route.ts",nextConfigOutput:"export",userland:r}),{requestAsyncStorage:u,staticGenerationAsyncStorage:h,serverHooks:g}=c,m="/api/ai/route";function f(){return(0,n.patchFetch)({serverHooks:g,staticGenerationAsyncStorage:h})}},9303:(e,t,o)=>{e.exports=o(517)}};var t=require("../../../webpack-runtime.js");t.C(e);var o=e=>t(t.s=e),r=t.X(0,[948],()=>o(6002));module.exports=r})();