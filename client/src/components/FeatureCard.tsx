interface FeatureCardProps {
  title: string;
  description: string;
  icon: string;
}

export default function FeatureCard({ title, description, icon }: FeatureCardProps) {
  return (
    <div className="flex flex-col items-center text-center p-6 rounded-lg hover:shadow-md transition">
      <div className="bg-primary bg-opacity-10 w-16 h-16 flex items-center justify-center rounded-full mb-4">
        <i className={`bx ${icon} text-primary text-3xl`}></i>
      </div>
      <h3 className="font-heading font-bold text-xl mb-2">{title}</h3>
      <p className="text-gray-600">
        {description}
      </p>
    </div>
  );
}
