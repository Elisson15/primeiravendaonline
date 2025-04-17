interface TestimonialCardProps {
  name: string;
  courseTitle: string;
  content: string;
  avatarUrl: string;
  rating: number;
}

export default function TestimonialCard({
  name,
  courseTitle,
  content,
  avatarUrl,
  rating
}: TestimonialCardProps) {
  return (
    <div className="bg-[#F8F9FA] p-6 rounded-lg">
      <div className="flex items-center mb-4">
        <div className="text-amber-400 flex">
          {[...Array(rating)].map((_, i) => (
            <i key={i} className="bx bxs-star"></i>
          ))}
          {[...Array(5 - rating)].map((_, i) => (
            <i key={i + rating} className="bx bx-star text-gray-300"></i>
          ))}
        </div>
      </div>
      <p className="text-gray-600 mb-6 italic">
        "{content}"
      </p>
      <div className="flex items-center">
        <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
          <img 
            src={`${avatarUrl}?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80`} 
            alt={name} 
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <h4 className="font-bold text-gray-900">{name}</h4>
          <p className="text-sm text-gray-600">{courseTitle}</p>
        </div>
      </div>
    </div>
  );
}
