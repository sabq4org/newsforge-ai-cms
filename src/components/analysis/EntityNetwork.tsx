import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, MapPin, Building, Calendar, Brain } from '@phosphor-icons/react';

interface Entity {
  name: string;
  type: 'person' | 'location' | 'organization' | 'event' | 'concept';
  confidence: number;
  mentions: number;
  context?: string;
}

interface Relationship {
  from: string;
  to: string;
  type: 'related' | 'opposes' | 'supports' | 'located_in' | 'works_for';
  strength: number;
}

interface EntityNetworkProps {
  entities: Entity[];
  relationships: Relationship[];
}

export function EntityNetwork({ entities, relationships }: EntityNetworkProps) {
  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'person': return <User className="w-4 h-4" />;
      case 'location': return <MapPin className="w-4 h-4" />;
      case 'organization': return <Building className="w-4 h-4" />;
      case 'event': return <Calendar className="w-4 h-4" />;
      default: return <Brain className="w-4 h-4" />;
    }
  };

  const getEntityColor = (type: string) => {
    switch (type) {
      case 'person': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'location': return 'bg-green-100 text-green-800 border-green-200';
      case 'organization': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'event': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRelationshipColor = (type: string) => {
    switch (type) {
      case 'supports': return 'border-green-400';
      case 'opposes': return 'border-red-400';
      case 'related': return 'border-blue-400';
      case 'located_in': return 'border-purple-400';
      case 'works_for': return 'border-orange-400';
      default: return 'border-gray-400';
    }
  };

  // Group entities by type for better visualization
  const groupedEntities = useMemo(() => {
    const groups: Record<string, Entity[]> = {};
    entities.forEach(entity => {
      if (!groups[entity.type]) {
        groups[entity.type] = [];
      }
      groups[entity.type].push(entity);
    });
    return groups;
  }, [entities]);

  // Create a simple force-directed layout simulation
  const entityPositions = useMemo(() => {
    const positions: Record<string, { x: number; y: number }> = {};
    const centerX = 300;
    const centerY = 200;
    const radius = 150;
    
    let currentAngle = 0;
    const angleStep = (2 * Math.PI) / entities.length;
    
    entities.forEach(entity => {
      positions[entity.name] = {
        x: centerX + Math.cos(currentAngle) * radius,
        y: centerY + Math.sin(currentAngle) * radius
      };
      currentAngle += angleStep;
    });
    
    return positions;
  }, [entities]);

  return (
    <div className="space-y-6">
      {/* Entity Types Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {Object.entries(groupedEntities).map(([type, typeEntities]) => (
          <Card key={type} className="text-center">
            <CardContent className="pt-4">
              <div className="flex items-center justify-center mb-2">
                {getEntityIcon(type)}
              </div>
              <p className="text-sm font-medium">{type}</p>
              <p className="text-xs text-muted-foreground">
                {typeEntities.length} عنصر
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Visual Network */}
      <Card>
        <CardHeader>
          <CardTitle>شبكة العلاقات التفاعلية</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative w-full h-96 bg-muted/20 rounded-lg overflow-hidden">
            <svg width="100%" height="100%" className="absolute inset-0">
              {/* Render relationships as lines */}
              {relationships.map((rel, index) => {
                const fromPos = entityPositions[rel.from];
                const toPos = entityPositions[rel.to];
                
                if (!fromPos || !toPos) return null;
                
                return (
                  <g key={index}>
                    <line
                      x1={fromPos.x}
                      y1={fromPos.y}
                      x2={toPos.x}
                      y2={toPos.y}
                      stroke="currentColor"
                      strokeWidth={rel.strength * 3}
                      strokeOpacity={0.6}
                      className={getRelationshipColor(rel.type)}
                    />
                    {/* Relationship label */}
                    <text
                      x={(fromPos.x + toPos.x) / 2}
                      y={(fromPos.y + toPos.y) / 2}
                      fontSize="10"
                      fill="currentColor"
                      textAnchor="middle"
                      className="text-xs fill-muted-foreground"
                    >
                      {rel.type}
                    </text>
                  </g>
                );
              })}
              
              {/* Render entities as nodes */}
              {entities.map((entity, index) => {
                const pos = entityPositions[entity.name];
                if (!pos) return null;
                
                return (
                  <g key={index}>
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={Math.max(20, entity.mentions * 5)}
                      className={`fill-current ${getEntityColor(entity.type)}`}
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <text
                      x={pos.x}
                      y={pos.y + 4}
                      fontSize="10"
                      fill="currentColor"
                      textAnchor="middle"
                      className="text-xs font-medium pointer-events-none"
                    >
                      {entity.name.length > 12 ? entity.name.substring(0, 12) + '...' : entity.name}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Entity List */}
      <div className="grid gap-4 md:grid-cols-2">
        {entities.map((entity, index) => (
          <Card key={index} className="relative">
            <CardContent className="pt-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${getEntityColor(entity.type)}`}>
                    {getEntityIcon(entity.type)}
                  </div>
                  <div>
                    <h4 className="font-semibold">{entity.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      {entity.type} • ذُكر {entity.mentions} مرة
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {Math.round(entity.confidence * 100)}% ثقة
                </Badge>
              </div>
              
              {entity.context && (
                <p className="text-sm text-muted-foreground mt-3 text-right">
                  {entity.context}
                </p>
              )}
              
              {/* Show relationships for this entity */}
              <div className="mt-3">
                {relationships
                  .filter(rel => rel.from === entity.name || rel.to === entity.name)
                  .slice(0, 2)
                  .map((rel, relIndex) => (
                    <div key={relIndex} className="text-xs text-muted-foreground">
                      {rel.from === entity.name ? (
                        <span>{rel.type} → {rel.to}</span>
                      ) : (
                        <span>{rel.from} → {rel.type}</span>
                      )}
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}