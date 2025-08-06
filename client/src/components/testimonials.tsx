import { Star } from "lucide-react";

export default function Testimonials() {
  const testimonials = [
    {
      rating: 5,
      content: "BuildwiseAI transformed how we evaluate development opportunities. The feasibility calculator alone has saved us weeks of manual analysis.",
      name: "Michael Chen",
      title: "Principal Developer, Pacific Coast Developments",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=150&h=150"
    },
    {
      rating: 5,
      content: "The automated reporting feature is a game-changer. Our investors receive professional updates without any manual effort from our team.",
      name: "Sarah Mitchell",
      title: "Managing Partner, Urban Build Group",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b332c217?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=150&h=150"
    },
    {
      rating: 5,
      content: "As a finance consultant, I recommend BuildwiseAI to all my developer clients. The JV structuring tools are incredibly sophisticated.",
      name: "David Rodriguez",
      title: "Senior Financial Consultant, Rodriguez & Associates",
      avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=150&h=150"
    }
  ];

  return (
    <section className="py-20 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-neutral-900 mb-4">
            Trusted by Developers Across Canada
          </h2>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
            See how BuildwiseAI is helping real estate professionals streamline their development finance workflows.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white p-8 rounded-xl shadow-sm" data-testid={`testimonial-card-${index}`}>
              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, starIndex) => (
                  <Star key={starIndex} className="h-5 w-5 text-brand-amber fill-current" />
                ))}
              </div>
              <p className="text-neutral-700 mb-6">"{testimonial.content}"</p>
              <div className="flex items-center gap-3">
                <img
                  src={testimonial.avatar}
                  alt={`${testimonial.name}, ${testimonial.title}`}
                  className="w-12 h-12 rounded-full"
                  data-testid={`testimonial-avatar-${index}`}
                />
                <div>
                  <div className="font-semibold text-neutral-900" data-testid={`testimonial-name-${index}`}>
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-neutral-600" data-testid={`testimonial-title-${index}`}>
                    {testimonial.title}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
