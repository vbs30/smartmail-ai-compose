
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, X, Sparkles, Target, User, Building } from 'lucide-react';

interface PersonalizationField {
  id: string;
  label: string;
  value: string;
  type: 'text' | 'textarea';
  category: 'recipient' | 'company' | 'context' | 'offer';
}

interface AdvancedPersonalizationProps {
  onPersonalizationChange: (fields: PersonalizationField[]) => void;
  initialFields?: PersonalizationField[];
}

const AdvancedPersonalization: React.FC<AdvancedPersonalizationProps> = ({ 
  onPersonalizationChange, 
  initialFields = [] 
}) => {
  const [fields, setFields] = useState<PersonalizationField[]>(initialFields.length > 0 ? initialFields : [
    { id: '1', label: 'Recipient Name', value: '', type: 'text', category: 'recipient' },
    { id: '2', label: 'Company Name', value: '', type: 'text', category: 'company' },
    { id: '3', label: 'Industry', value: '', type: 'text', category: 'company' },
    { id: '4', label: 'Pain Point', value: '', type: 'text', category: 'context' },
  ]);

  const predefinedFields = {
    recipient: [
      'Recipient Name', 'Recipient Title', 'Department', 'Years of Experience', 'Location', 'LinkedIn Profile'
    ],
    company: [
      'Company Name', 'Industry', 'Company Size', 'Revenue', 'Recent News', 'Competitors', 'Company Achievement'
    ],
    context: [
      'Pain Point', 'Previous Interaction', 'Mutual Connection', 'Specific Challenge', 'Goal/Objective', 'Timeline'
    ],
    offer: [
      'Product/Service', 'Unique Value Proposition', 'Pricing', 'Special Offer', 'Success Story', 'ROI/Benefit'
    ]
  };

  const categoryIcons = {
    recipient: User,
    company: Building,
    context: Target,
    offer: Sparkles
  };

  const categoryColors = {
    recipient: 'bg-blue-100 text-blue-800',
    company: 'bg-green-100 text-green-800',
    context: 'bg-purple-100 text-purple-800',
    offer: 'bg-orange-100 text-orange-800'
  };

  const addField = (label: string, category: keyof typeof predefinedFields) => {
    const newField: PersonalizationField = {
      id: Date.now().toString(),
      label,
      value: '',
      type: label.includes('Description') || label.includes('Challenge') ? 'textarea' : 'text',
      category
    };
    
    const updatedFields = [...fields, newField];
    setFields(updatedFields);
    onPersonalizationChange(updatedFields);
  };

  const removeField = (id: string) => {
    const updatedFields = fields.filter(field => field.id !== id);
    setFields(updatedFields);
    onPersonalizationChange(updatedFields);
  };

  const updateField = (id: string, value: string) => {
    const updatedFields = fields.map(field => 
      field.id === id ? { ...field, value } : field
    );
    setFields(updatedFields);
    onPersonalizationChange(updatedFields);
  };

  const addCustomField = () => {
    const customLabel = prompt('Enter custom field name:');
    if (customLabel && customLabel.trim()) {
      addField(customLabel.trim(), 'context');
    }
  };

  const groupedFields = fields.reduce((acc, field) => {
    if (!acc[field.category]) {
      acc[field.category] = [];
    }
    acc[field.category].push(field);
    return acc;
  }, {} as Record<string, PersonalizationField[]>);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Sparkles className="w-5 h-5 mr-2 text-purple-600" />
          Advanced Personalization
        </CardTitle>
        <p className="text-sm text-gray-600">
          Add detailed information to create highly personalized emails that convert better
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Fields */}
        {Object.entries(groupedFields).map(([category, categoryFields]) => {
          const IconComponent = categoryIcons[category as keyof typeof categoryIcons];
          return (
            <div key={category} className="space-y-3">
              <div className="flex items-center space-x-2">
                <IconComponent className="w-4 h-4" />
                <h4 className="font-medium capitalize">{category} Information</h4>
                <Badge className={categoryColors[category as keyof typeof categoryColors]} variant="secondary">
                  {categoryFields.length} field{categoryFields.length !== 1 ? 's' : ''}
                </Badge>
              </div>
              
              <div className="grid gap-3">
                {categoryFields.map((field) => (
                  <div key={field.id} className="flex items-end space-x-2">
                    <div className="flex-1">
                      <Label htmlFor={field.id} className="text-sm">{field.label}</Label>
                      {field.type === 'textarea' ? (
                        <Textarea
                          id={field.id}
                          value={field.value}
                          onChange={(e) => updateField(field.id, e.target.value)}
                          placeholder={`Enter ${field.label.toLowerCase()}...`}
                          rows={2}
                        />
                      ) : (
                        <Input
                          id={field.id}
                          value={field.value}
                          onChange={(e) => updateField(field.id, e.target.value)}
                          placeholder={`Enter ${field.label.toLowerCase()}...`}
                        />
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeField(field.id)}
                      className="px-2 py-1 h-8 w-8"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        <Separator />

        {/* Quick Add Fields */}
        <div className="space-y-4">
          <h4 className="font-medium">Quick Add Fields</h4>
          {Object.entries(predefinedFields).map(([category, fieldList]) => {
            const IconComponent = categoryIcons[category as keyof typeof categoryIcons];
            const existingLabels = fields.map(f => f.label);
            const availableFields = fieldList.filter(field => !existingLabels.includes(field));
            
            if (availableFields.length === 0) return null;

            return (
              <div key={category} className="space-y-2">
                <div className="flex items-center space-x-2">
                  <IconComponent className="w-4 h-4" />
                  <span className="text-sm font-medium capitalize">{category}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {availableFields.map((field) => (
                    <Button
                      key={field}
                      variant="outline"
                      size="sm"
                      onClick={() => addField(field, category as keyof typeof predefinedFields)}
                      className="text-xs h-7"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      {field}
                    </Button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <Separator />

        {/* Custom Field */}
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={addCustomField}
            className="w-full max-w-xs"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Custom Field
          </Button>
        </div>

        {/* Personalization Tips */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">💡 Personalization Tips</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Research the recipient's recent LinkedIn activity or company news</li>
            <li>• Mention specific challenges relevant to their industry</li>
            <li>• Reference mutual connections or shared experiences</li>
            <li>• Include quantifiable benefits or success stories</li>
            <li>• Use their company's terminology and language style</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdvancedPersonalization;
