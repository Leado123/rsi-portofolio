import { useEffect, useRef } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

interface RenderKaTeXProps {
  htmlContent: string;
}

export const RenderKaTeX: React.FC<RenderKaTeXProps> = ({ htmlContent }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Find all elements with katex-eq class or data-katex attributes
    const katexElements = containerRef.current.querySelectorAll(
      ".katex-eq, span[data-katex], span[data-katex-display]"
    );

    katexElements.forEach((element) => {
      const htmlElement = element as HTMLElement;
      
      // Check if already rendered
      if (htmlElement.querySelector(".katex")) {
        return;
      }

      // Get KaTeX content - WordPress puts it in textContent, not data attributes
      // data-katex-display="true" is just a flag, the formula is in textContent
      let katexContent = htmlElement.textContent?.trim() || 
                        htmlElement.getAttribute("data-katex") || "";
      
      // Check if it's display mode - WordPress uses data-katex-display="true" or katex-eq class
      const isDisplayMode = htmlElement.hasAttribute("data-katex-display") ||
                           htmlElement.getAttribute("data-katex-display") === "true" ||
                           htmlElement.classList.contains("katex-eq");

      if (katexContent) {
        try {
          // Unescape HTML entities that WordPress might have encoded
          katexContent = katexContent
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&amp;/g, "&")
            .replace(/&#8220;/g, '"')
            .replace(/&#8221;/g, '"')
            .replace(/&#8217;/g, "'")
            .replace(/&#8216;/g, "'");

          const rendered = katex.renderToString(katexContent, {
            throwOnError: false,
            displayMode: isDisplayMode,
            strict: false,
          });
          
          // Replace the element content with rendered KaTeX
          htmlElement.innerHTML = rendered;
          htmlElement.classList.add("katex-rendered");
        } catch (error) {
          console.error("KaTeX rendering error:", error, "Content:", katexContent);
        }
      }
    });

    // Also process inline math delimiters \( \) and \[ \]
    const processInlineMath = (text: string): string => {
      // Process display math \[ \]
      text = text.replace(/\\\[([\s\S]*?)\\\]/g, (match, formula) => {
        try {
          return katex.renderToString(formula.trim(), {
            throwOnError: false,
            displayMode: true,
            strict: false,
          });
        } catch (error) {
          return match;
        }
      });

      // Process inline math \( \)
      text = text.replace(/\\\(([\s\S]*?)\\\)/g, (match, formula) => {
        try {
          return katex.renderToString(formula.trim(), {
            throwOnError: false,
            displayMode: false,
            strict: false,
          });
        } catch (error) {
          return match;
        }
      });

      return text;
    };

    // Process text nodes for inline math (but skip already processed elements)
    const walker = document.createTreeWalker(
      containerRef.current,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          const parent = node.parentElement;
          if (parent?.classList.contains("katex") || 
              parent?.classList.contains("katex-rendered")) {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    const textNodes: Text[] = [];
    let node;
    while ((node = walker.nextNode())) {
      if (node.textContent && (/\\[\(\[\)\]]/.test(node.textContent))) {
        textNodes.push(node as Text);
      }
    }

    textNodes.forEach((textNode) => {
      const parent = textNode.parentElement;
      if (parent && !parent.classList.contains("katex") && !parent.classList.contains("katex-rendered")) {
        const processed = processInlineMath(textNode.textContent || "");
        if (processed !== textNode.textContent) {
          const wrapper = document.createElement("span");
          wrapper.innerHTML = processed;
          parent.replaceChild(wrapper, textNode);
        }
      }
    });
  }, [htmlContent]);

  return (
    <div
      ref={containerRef}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
};

