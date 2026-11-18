import type {PortableTextComponents} from 'next-sanity';

// Allow-listed rich text: paragraphs, one subheading level, lists, links.
export const portableText: PortableTextComponents = {
  block: {
    normal: ({children}) => <p className="leading-relaxed">{children}</p>,
    h3: ({children}) => <h3 className="pt-2 font-display text-2xl font-semibold text-teal-900">{children}</h3>,
  },
  list: {
    bullet: ({children}) => <ul className="list-disc space-y-1 pl-5">{children}</ul>,
    number: ({children}) => <ol className="list-decimal space-y-1 pl-5">{children}</ol>,
  },
  marks: {
    link: ({value, children}) => {
      const href = (value as {href?: string})?.href ?? '';
      const external = /^https?:\/\//.test(href);
      return (
        <a href={href} className="text-teal-700 underline underline-offset-2" {...(external ? {rel: 'noopener', target: '_blank'} : {})}>
          {children}
        </a>
      );
    },
  },
};
