interface Answer {
  id: number;
  answer: string;
  upvotes_count?: number;
  is_helpful?: boolean;
  created_at: string;
  user: {
    id: number;
    name: string;
  };
}

interface Question {
  id: number;
  title: string;
  question: string;
  answers_count?: number;
  upvotes_count?: number;
  created_at: string;
  updated_at: string;
  user: {
    id: number;
    name: string;
  };
  answers?: Answer[];
  tags?: { id: number; name: string }[];
}

interface QuestionSchemaProps {
  question: Question;
}

export function QuestionSchema({ question }: QuestionSchemaProps) {
  const acceptedAnswer = question.answers?.find((a) => a.is_helpful);

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'QAPage',
    mainEntity: {
      '@type': 'Question',
      name: question.title,
      text: question.question,
      answerCount: question.answers_count || 0,
      upvoteCount: question.upvotes_count || 0,
      dateCreated: question.created_at,
      dateModified: question.updated_at,
      author: {
        '@type': 'Person',
        name: question.user.name,
      },
      ...(acceptedAnswer && {
        acceptedAnswer: {
          '@type': 'Answer',
          text: acceptedAnswer.answer,
          upvoteCount: acceptedAnswer.upvotes_count || 0,
          dateCreated: acceptedAnswer.created_at,
          author: {
            '@type': 'Person',
            name: acceptedAnswer.user.name,
          },
        },
      }),
      ...(question.answers &&
        question.answers.length > 0 && {
          suggestedAnswer: question.answers
            .filter((a) => !a.is_helpful)
            .map((answer) => ({
              '@type': 'Answer',
              text: answer.answer,
              upvoteCount: answer.upvotes_count || 0,
              dateCreated: answer.created_at,
              author: {
                '@type': 'Person',
                name: answer.user.name,
              },
            })),
        }),
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
