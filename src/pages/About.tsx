import { Link } from 'wouter';
import { Users, ShoppingBag, MapPin, Clock, Leaf, Heart, Zap, Shield, ArrowRight, CheckCircle2 } from 'lucide-react';

const team = [
  { name: 'Rajesh Mehta', role: 'Founder & CEO', img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80', bio: '15 years in FMCG. Built Boxaio to bridge the gap between farmers and consumers.' },
  { name: 'Priya Sharma', role: 'Head of Operations', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80', bio: 'IIM Bangalore alum. Leads 200+ person operations team across 30 cities.' },
  { name: 'Amit Kumar', role: 'Head of Supply Chain', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80', bio: 'Supply chain veteran. Architected our farm-to-door cold chain network.' },
];

const values = [
  { icon: Shield, title: 'Quality First', desc: 'Every product passes a 5-step quality inspection. No compromises, ever.', color: 'bg-blue-100 text-blue-600' },
  { icon: Heart, title: 'Customer Centric', desc: "Every decision we make starts and ends with our customer's experience.", color: 'bg-rose-100 text-rose-600' },
  { icon: Leaf, title: 'Sustainable', desc: 'Eco-friendly packaging and zero food waste initiatives across all warehouses.', color: 'bg-emerald-100 text-emerald-600' },
  { icon: Zap, title: 'Fast Delivery', desc: 'Your time is valuable. We deliver when we say we will — every single time.', color: 'bg-amber-100 text-amber-600' },
];

const milestones = [
  { year: '2021', event: 'Boxaio founded in Bangalore with 50 products and 3 delivery zones' },
  { year: '2022', event: 'Expanded to 10 cities, crossed 10,000 active customers' },
  { year: '2023', event: 'Launched B2B retailer program. 5,000+ registered businesses' },
  { year: '2024', event: 'Raised Series A. Expanded to 30+ cities and 500+ products' },
  { year: '2025', event: 'Serving 50,000+ customers monthly. Mobile app launch' },
];

export function About() {
  return (
    <div className="pb-24">

      {/* Hero */}
      <div className="relative h-[70vh] min-h-[500px] flex items-end justify-start overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=1400&auto=format&fit=crop"
          className="absolute inset-0 w-full h-full object-cover"
          alt="Boxaio story"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/95 via-emerald-900/60 to-transparent" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pb-16 w-full">
          <span className="inline-block bg-emerald-500/30 border border-emerald-400/40 text-emerald-200 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-5">
            Our Story
          </span>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-4 leading-none">
            Redefining<br />Grocery.
          </h1>
          <p className="text-emerald-100 text-xl max-w-xl leading-relaxed">
            We bring the wholesale market directly to your screen — combining premium quality with unbeatable prices.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Stats */}
        <div className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 rounded-3xl p-8 md:p-12 shadow-2xl grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white -mt-14 relative z-20 mb-24">
          {[
            { icon: Users, value: '50K+', label: 'Happy Customers' },
            { icon: ShoppingBag, value: '500+', label: 'Products' },
            { icon: MapPin, value: '30+', label: 'Cities Served' },
            { icon: Clock, value: '99%', label: 'On-Time Delivery' },
          ].map(({ icon: Icon, value, label }) => (
            <div key={label} className="flex flex-col items-center gap-2">
              <Icon className="w-7 h-7 text-emerald-300" />
              <div className="text-3xl md:text-4xl font-black">{value}</div>
              <div className="text-emerald-200 text-sm font-medium uppercase tracking-wider">{label}</div>
            </div>
          ))}
        </div>

        {/* Our Story */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-14 items-center mb-24">
          <div>
            <p className="text-emerald-600 text-sm font-bold uppercase tracking-wider mb-3">Who we are</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6 leading-tight">The Boxaio Story</h2>
            <p className="text-gray-600 text-base leading-relaxed mb-4">
              Founded in 2021, Boxaio started with a simple observation: buying groceries in bulk shouldn't mean compromising on quality or convenience. Traditional wholesale markets are crowded, time-consuming, and inaccessible for most urban families.
            </p>
            <p className="text-gray-600 text-base leading-relaxed mb-6">
              We cut out the middlemen and built direct relationships with 500+ farmers and top FMCG brands. Our state-of-the-art cold-chain supply chain ensures maximum freshness — whether you're a family stocking up for the month or a restaurant managing daily inventory.
            </p>
            <div className="space-y-3">
              {['FSSAI certified supply chain', 'Direct from 500+ farmers & brands', 'Zero food wastage initiative', 'ISO 9001:2015 certified warehouses'].map(pt => (
                <div key={pt} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span className="text-gray-700 text-sm font-medium">{pt}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="rounded-3xl overflow-hidden shadow-2xl aspect-square">
              <img
                src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=700&auto=format&fit=crop"
                className="w-full h-full object-cover"
                alt="Boxaio store"
              />
            </div>
            <div className="absolute -bottom-5 -left-5 bg-white rounded-2xl shadow-xl p-5 border border-gray-100">
              <p className="text-3xl font-black text-emerald-700">4.8</p>
              <div className="flex text-amber-400 text-sm">★★★★★</div>
              <p className="text-xs text-gray-500 mt-1">App Store Rating</p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="mb-24">
          <p className="text-emerald-600 text-sm font-bold uppercase tracking-wider mb-3">Our journey</p>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-12">Milestones</h2>
          <div className="relative">
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-emerald-200 -translate-x-1/2" />
            <div className="space-y-8">
              {milestones.map((m, i) => (
                <div key={m.year} className={`flex items-start gap-6 md:gap-0 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                  <div className={`hidden md:block flex-1 ${i % 2 === 0 ? 'pr-12 text-right' : 'pl-12 text-left'}`}>
                    <div className="text-2xl font-black text-emerald-700">{m.year}</div>
                  </div>
                  <div className="relative z-10 w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                    <span className="text-white font-black text-xs">{m.year.slice(2)}</span>
                  </div>
                  <div className={`flex-1 md:${i % 2 === 0 ? 'pl-12' : 'pr-12 text-right'} pl-4 md:pl-12`}>
                    <p className="text-gray-700 font-medium text-sm leading-relaxed">{m.event}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="mb-24">
          <p className="text-emerald-600 text-sm font-bold uppercase tracking-wider mb-3 text-center">What drives us</p>
          <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-12">Our Core Values</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {values.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="glass-card bg-white p-7 rounded-3xl border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-1 text-center">
                <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center mx-auto mb-5`}>
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-lg">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Team */}
        <div className="mb-24">
          <p className="text-emerald-600 text-sm font-bold uppercase tracking-wider mb-3 text-center">The people behind Boxaio</p>
          <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-14">Leadership Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map(member => (
              <div key={member.name} className="group bg-white rounded-3xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="h-56 overflow-hidden bg-gray-100">
                  <img
                    src={member.img}
                    alt={member.name}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500 grayscale group-hover:grayscale-0"
                  />
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-gray-900 text-xl">{member.name}</h3>
                  <p className="text-emerald-600 font-semibold text-sm mb-3">{member.role}</p>
                  <p className="text-gray-500 text-sm leading-relaxed">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-gray-900 to-emerald-900 py-20 text-center text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/3 w-64 h-64 rounded-full bg-emerald-400 -translate-y-1/2" />
        </div>
        <div className="relative z-10 max-w-2xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Ready for the Boxaio experience?</h2>
          <p className="text-gray-300 mb-8 leading-relaxed">Join 50,000+ smart shoppers who save more every month with Boxaio's premium grocery marketplace.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/products" className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold px-8 py-4 rounded-full hover:scale-105 transition-transform shadow-lg">
              Start Shopping <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/register" className="inline-flex items-center justify-center gap-2 bg-white/10 border border-white/20 text-white font-bold px-8 py-4 rounded-full hover:bg-white/20 transition-all">
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
