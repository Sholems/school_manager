'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    GraduationCap,
    Users,
    Award,
    BookOpen,
    Shield,
    Heart,
    Phone,
    Mail,
    MapPin,
    ArrowRight,
    Star,
    CheckCircle,
    Clock,
    Calendar
} from 'lucide-react';

interface LandingPageProps {
    settings: {
        school_name: string;
        school_tagline: string;
        school_address: string;
        school_email: string;
        school_phone: string;
        logo_media: string | null;
        landing_hero_title: string;
        landing_hero_subtitle: string;
        landing_features: string;
        landing_hero_image: string | null;
        landing_about_text: string;
        landing_primary_color: string;
        landing_show_stats: boolean;
        landing_cta_text: string;
    };
    stats: {
        studentsCount: number;
        teachersCount: number;
        classesCount: number;
    };
}

const FeatureIcon = ({ name }: { name: string }) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('academic') || lowerName.includes('excellence')) return <Award className="h-8 w-8" />;
    if (lowerName.includes('teacher') || lowerName.includes('expert')) return <Users className="h-8 w-8" />;
    if (lowerName.includes('facilit') || lowerName.includes('modern')) return <BookOpen className="h-8 w-8" />;
    if (lowerName.includes('safe') || lowerName.includes('secure')) return <Shield className="h-8 w-8" />;
    if (lowerName.includes('holistic') || lowerName.includes('develop')) return <Heart className="h-8 w-8" />;
    if (lowerName.includes('afford') || lowerName.includes('fee')) return <CheckCircle className="h-8 w-8" />;
    return <Star className="h-8 w-8" />;
};

export const LandingPage: React.FC<LandingPageProps> = ({ settings, stats }) => {
    const [isScrolled, setIsScrolled] = useState(false);
    const features = settings.landing_features.split(',').map(f => f.trim()).filter(f => f);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="min-h-screen bg-white">
            {/* Navigation */}
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
                }`}>
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {settings.logo_media ? (
                                <img src={settings.logo_media} alt="Logo" className="h-12 w-12 rounded-xl object-contain" />
                            ) : (
                                <div className="h-12 w-12 bg-brand-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                                    {settings.school_name.substring(0, 2).toUpperCase()}
                                </div>
                            )}
                            <div className="hidden sm:block">
                                <h1 className={`font-bold text-lg transition-colors ${isScrolled ? 'text-gray-900' : 'text-white'}`}>
                                    {settings.school_name}
                                </h1>
                            </div>
                        </div>
                        <Link
                            href="/dashboard"
                            className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-brand-200 transition-all hover:scale-105 flex items-center gap-2"
                        >
                            Portal Login <ArrowRight size={16} />
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section
                className="relative min-h-screen flex items-center justify-center overflow-hidden"
                style={{
                    background: settings.landing_hero_image
                        ? `linear-gradient(to bottom, rgba(0,0,0,0.6), rgba(0,0,0,0.8)), url(${settings.landing_hero_image})`
                        : `linear-gradient(135deg, ${settings.landing_primary_color}dd 0%, #14532d 100%)`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                }}
            >
                {/* Animated Background Elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl"></div>
                </div>

                <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
                    {settings.logo_media ? (
                        <img src={settings.logo_media} alt="Logo" className="h-28 w-28 mx-auto mb-8 rounded-3xl shadow-2xl object-contain bg-white/10 p-2" />
                    ) : (
                        <div className="h-28 w-28 mx-auto mb-8 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center text-white font-black text-4xl shadow-2xl">
                            <GraduationCap size={56} />
                        </div>
                    )}

                    <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight leading-tight">
                        {settings.landing_hero_title}
                    </h1>

                    <p className="text-xl md:text-2xl text-white/80 mb-4 font-medium max-w-3xl mx-auto">
                        {settings.landing_hero_subtitle}
                    </p>

                    <p className="text-lg text-white/60 mb-10 italic">
                        {settings.school_tagline}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Link
                            href="/dashboard"
                            className="bg-white text-gray-900 px-10 py-4 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-3xl transition-all hover:scale-105 flex items-center gap-3"
                        >
                            {settings.landing_cta_text} <ArrowRight size={20} />
                        </Link>
                        <a
                            href="#contact"
                            className="bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 px-10 py-4 rounded-2xl font-bold text-lg hover:bg-white/20 transition-all flex items-center gap-3"
                        >
                            Contact Us <Phone size={18} />
                        </a>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
                    <div className="w-8 h-14 rounded-full border-2 border-white/30 flex items-start justify-center p-2">
                        <div className="w-2 h-3 bg-white/60 rounded-full animate-pulse"></div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            {settings.landing_show_stats && (
                <section className="py-12 bg-gray-50 border-b">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            <div className="text-center">
                                <div className="text-4xl md:text-5xl font-black text-brand-600">{stats.studentsCount}+</div>
                                <div className="text-gray-500 font-medium mt-1">Students</div>
                            </div>
                            <div className="text-center">
                                <div className="text-4xl md:text-5xl font-black text-brand-600">{stats.teachersCount}+</div>
                                <div className="text-gray-500 font-medium mt-1">Teachers</div>
                            </div>
                            <div className="text-center">
                                <div className="text-4xl md:text-5xl font-black text-brand-600">{stats.classesCount}</div>
                                <div className="text-gray-500 font-medium mt-1">Classes</div>
                            </div>
                            <div className="text-center">
                                <div className="text-4xl md:text-5xl font-black text-brand-600">15+</div>
                                <div className="text-gray-500 font-medium mt-1">Years Experience</div>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Features Section */}
            <section className="py-24 bg-white" id="features">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <span className="text-brand-600 font-bold text-sm uppercase tracking-wider">Why Choose Us</span>
                        <h2 className="text-4xl md:text-5xl font-black text-gray-900 mt-4 mb-6">
                            What Makes Us Different
                        </h2>
                        <p className="text-xl text-gray-500 max-w-2xl mx-auto">
                            We provide a nurturing environment where every child can thrive and reach their full potential.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="group bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-2xl hover:border-brand-100 transition-all duration-300 hover:-translate-y-2"
                            >
                                <div className="h-16 w-16 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                                    <FeatureIcon name={feature} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature}</h3>
                                <p className="text-gray-500 leading-relaxed">
                                    We are dedicated to providing the best in {feature.toLowerCase()} for all our students.
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section className="py-24 bg-gray-50" id="about">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <span className="text-brand-600 font-bold text-sm uppercase tracking-wider">About Our School</span>
                            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mt-4 mb-8">
                                Building Tomorrow's Leaders Today
                            </h2>
                            <p className="text-lg text-gray-600 leading-relaxed mb-8">
                                {settings.landing_about_text}
                            </p>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="flex items-center gap-3">
                                    <div className="h-12 w-12 bg-brand-100 text-brand-600 rounded-xl flex items-center justify-center">
                                        <Clock size={24} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-900">7:30 AM - 3:00 PM</div>
                                        <div className="text-sm text-gray-500">School Hours</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="h-12 w-12 bg-brand-100 text-brand-600 rounded-xl flex items-center justify-center">
                                        <Calendar size={24} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-900">Sept - July</div>
                                        <div className="text-sm text-gray-500">Academic Year</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="bg-gradient-to-br from-brand-500 to-brand-700 rounded-3xl p-8 text-white">
                                <GraduationCap size={64} className="mb-6 opacity-80" />
                                <h3 className="text-2xl font-bold mb-4">Enroll Your Child Today</h3>
                                <p className="text-white/80 mb-6">
                                    Join our community of learners and give your child the best start in education.
                                </p>
                                <Link
                                    href="/dashboard"
                                    className="inline-flex items-center gap-2 bg-white text-brand-600 px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors"
                                >
                                    Get Started <ArrowRight size={18} />
                                </Link>
                            </div>
                            <div className="absolute -bottom-6 -right-6 h-32 w-32 bg-brand-100 rounded-3xl -z-10"></div>
                            <div className="absolute -top-6 -left-6 h-24 w-24 bg-brand-50 rounded-3xl -z-10"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section className="py-24 bg-white" id="contact">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <span className="text-brand-600 font-bold text-sm uppercase tracking-wider">Get In Touch</span>
                        <h2 className="text-4xl md:text-5xl font-black text-gray-900 mt-4 mb-6">
                            Contact Us
                        </h2>
                        <p className="text-xl text-gray-500 max-w-2xl mx-auto">
                            Have questions? We'd love to hear from you. Reach out to us through any of these channels.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                        <a href={`tel:${settings.school_phone}`} className="group bg-gray-50 hover:bg-brand-600 p-8 rounded-3xl text-center transition-all duration-300">
                            <div className="h-16 w-16 bg-brand-100 group-hover:bg-white/20 text-brand-600 group-hover:text-white rounded-2xl flex items-center justify-center mx-auto mb-6 transition-colors">
                                <Phone size={28} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-white mb-2 transition-colors">Phone</h3>
                            <p className="text-gray-500 group-hover:text-white/80 transition-colors">{settings.school_phone}</p>
                        </a>

                        <a href={`mailto:${settings.school_email}`} className="group bg-gray-50 hover:bg-brand-600 p-8 rounded-3xl text-center transition-all duration-300">
                            <div className="h-16 w-16 bg-brand-100 group-hover:bg-white/20 text-brand-600 group-hover:text-white rounded-2xl flex items-center justify-center mx-auto mb-6 transition-colors">
                                <Mail size={28} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-white mb-2 transition-colors">Email</h3>
                            <p className="text-gray-500 group-hover:text-white/80 transition-colors">{settings.school_email}</p>
                        </a>

                        <div className="group bg-gray-50 hover:bg-brand-600 p-8 rounded-3xl text-center transition-all duration-300">
                            <div className="h-16 w-16 bg-brand-100 group-hover:bg-white/20 text-brand-600 group-hover:text-white rounded-2xl flex items-center justify-center mx-auto mb-6 transition-colors">
                                <MapPin size={28} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-white mb-2 transition-colors">Address</h3>
                            <p className="text-gray-500 group-hover:text-white/80 transition-colors">{settings.school_address}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-16">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                        <div className="md:col-span-2">
                            <div className="flex items-center gap-3 mb-6">
                                {settings.logo_media ? (
                                    <img src={settings.logo_media} alt="Logo" className="h-14 w-14 rounded-xl object-contain" />
                                ) : (
                                    <div className="h-14 w-14 bg-brand-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                                        {settings.school_name.substring(0, 2).toUpperCase()}
                                    </div>
                                )}
                                <h3 className="text-xl font-bold">{settings.school_name}</h3>
                            </div>
                            <p className="text-gray-400 leading-relaxed mb-6 max-w-md">
                                {settings.school_tagline}
                            </p>
                            <p className="text-gray-500 text-sm">
                                © {new Date().getFullYear()} {settings.school_name}. All rights reserved.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-bold text-lg mb-6">Quick Links</h4>
                            <ul className="space-y-3">
                                <li><a href="#features" className="text-gray-400 hover:text-white transition-colors">Features</a></li>
                                <li><a href="#about" className="text-gray-400 hover:text-white transition-colors">About Us</a></li>
                                <li><a href="#contact" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
                                <li><Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">Portal Login</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold text-lg mb-6">Contact Info</h4>
                            <ul className="space-y-3 text-gray-400">
                                <li className="flex items-center gap-2">
                                    <Phone size={16} className="text-brand-500" />
                                    {settings.school_phone}
                                </li>
                                <li className="flex items-center gap-2">
                                    <Mail size={16} className="text-brand-500" />
                                    {settings.school_email}
                                </li>
                                <li className="flex items-start gap-2">
                                    <MapPin size={16} className="text-brand-500 mt-1 shrink-0" />
                                    {settings.school_address}
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};
