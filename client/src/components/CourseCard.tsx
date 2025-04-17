import { Link } from "wouter";
import { Course } from "@shared/schema";

interface CourseCardProps {
  course: Course;
}

export default function CourseCard({ course }: CourseCardProps) {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition">
      <div className="h-48 overflow-hidden">
        <img 
          src={`${course.imageUrl}?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80`} 
          alt={course.title} 
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-6">
        <div className="flex justify-between items-center mb-3">
          <span className={`${course.isPopular ? 'bg-primary bg-opacity-10 text-primary' : 'bg-[#BB86FC] bg-opacity-10 text-[#4a148c]'} text-xs font-semibold px-2 py-1 rounded`}>
            {course.level}
          </span>
          <span className="text-[#03DAC5] font-semibold">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(course.price / 100)}
          </span>
        </div>
        <h3 className="font-heading font-bold text-lg mb-2">{course.title}</h3>
        <p className="text-gray-600 text-sm mb-4">
          {course.description}
        </p>
        <div className="flex items-center text-sm text-gray-600 mb-4">
          <i className="bx bx-time mr-2"></i> {course.duration} horas de conteúdo
        </div>
        <Link 
          href={`/cursos/${course.slug}`} 
          className="block text-center py-2 px-4 bg-primary text-white rounded-md hover:bg-[#4a148c] transition"
        >
          Ver detalhes
        </Link>
      </div>
    </div>
  );
}
