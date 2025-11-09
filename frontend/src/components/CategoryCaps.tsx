import React from 'react';
import { CreditCard, Utensils, ShoppingBag, Film } from 'lucide-react';

const categoryIcons: Record<string, React.ReactNode> = {
    'Food': <Utensils className="w-5 h-5 text-amber-600" />,
    'Shopping': <ShoppingBag className="w-5 h-5 text-blue-600" />,
    'Entertainment': <Film className="w-5 h-5 text-purple-600" />,
    'default': <CreditCard className="w-5 h-5 text-gray-500" />
};

interface CategoryCapsProps {
    categoryCaps?: {
        category_caps?: Record<string, number> | string;
    } | null;
    className?: string;
}

export function CategoryCaps({ categoryCaps, className = '' }: CategoryCapsProps) {
    // Convert to array of [category, amount] pairs
    const categories = React.useMemo(() => {
        console.log('Rendering with categoryCaps:', categoryCaps);

        if (!categoryCaps || !categoryCaps.category_caps) {
            console.log('No category_caps provided or empty');
            return [];
        }

        try {
            const caps = categoryCaps.category_caps;
            // If caps is a Map (Mongoose Map), convert to plain object

            // Handle both string and object formats
            let parsedCaps: Record<string, any> = {};

            // Handle Mongoose Map
            if (caps instanceof Map) {
                parsedCaps = Object.fromEntries(caps);
            }
            else if (typeof caps === 'string') {
                try {
                    parsedCaps = JSON.parse(caps.trim());
                } catch (e) {
                    console.error('Error parsing category_caps string:', e);
                    return [];
                }
            }
            else if (typeof caps === 'object' && caps !== null) {
                parsedCaps = { ...caps };
            }


            if (!parsedCaps || typeof parsedCaps !== 'object' || Array.isArray(parsedCaps)) {
                console.log('Invalid category_caps format:', parsedCaps);
                return [];
            }

            // Convert to array of [category, amount] pairs
            return Object.entries(parsedCaps)
                .filter(([_, amount]) => amount !== undefined && amount !== null)
                .map(([category, amount]) => [
                    String(category).trim(),
                    Number(amount) || 0
                ]);

        } catch (error) {
            console.error('Error processing category caps:', error, categoryCaps);
            return [];
        }
    }, [categoryCaps]);

    console.log('Rendering CategoryCaps with categories:', categories);

    if (categories.length === 0) {
        return (
            <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${className}`}>
                <div className="text-center text-gray-500">
                    <p>No spending limits set for categories</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden ${className}`}>
            <div className="p-4 border-b border-gray-100">
                <h3 className="font-medium text-gray-900 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-indigo-600" />
                    Category Spending Limits
                </h3>
            </div>
            <div className="divide-y divide-gray-100">
                {categories.map(([category, limit]) => {
                    const icon = categoryIcons[category as keyof typeof categoryIcons] || categoryIcons.default;

                    return (
                        <div key={String(category)} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gray-50 rounded-lg">
                                    {icon}
                                </div>
                                <span className="font-medium text-gray-900">{category}</span>
                            </div>
                            <div className="text-right">
                                <div className="font-medium text-gray-900">₹{Number(limit).toLocaleString()}</div>
                                <div className="text-xs text-gray-500">per month</div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
