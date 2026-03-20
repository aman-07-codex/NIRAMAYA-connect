import { Building2, MapPin, Phone, Droplet } from "lucide-react";

export type NgoInventoryDisplay = {
    inventory_id: string;
    blood_group: string;
    units: number;
    ngo: {
        id: string;
        ngo_name: string;
        city: string;
        address: string;
        phone: string;
    };
};

type NgoCardProps = {
    data: NgoInventoryDisplay;
    emergency?: boolean;
};

const NgoCard = ({ data, emergency }: NgoCardProps) => {
    return (
        <div
            className={`relative overflow-hidden rounded-xl border bg-card p-5 shadow-sm transition-all hover:shadow-md ${emergency ? "border-emergency/30 bg-emergency/5" : "hover:border-primary/30"
                }`}
        >
            {emergency && (
                <div className="absolute right-0 top-0 rounded-bl-lg bg-emergency px-3 py-1 text-xs font-bold text-primary-foreground animate-pulse">
                    EMERGENCY
                </div>
            )}

            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Building2 className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg leading-tight">{data.ngo.ngo_name}</h3>
                        <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success mt-1">
                            Verified Blood Bank
                        </span>
                    </div>
                </div>

                <div className="flex flex-col items-center justify-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 text-destructive font-bold">
                        {data.blood_group}
                    </div>
                    <span className="text-xs font-bold text-muted-foreground mt-1 text-center">{data.units} Units</span>
                </div>
            </div>

            <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 shrink-0 text-primary/70 mt-0.5" />
                    <span>{data.ngo.address}, {data.ngo.city}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 shrink-0 text-primary/70" />
                    <a href={`tel:${data.ngo.phone}`} className="hover:text-primary transition-colors font-medium">
                        {data.ngo.phone}
                    </a>
                </div>
            </div>

            <a
                href={`tel:${data.ngo.phone}`}
                className={`mt-6 flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-colors ${emergency
                        ? "bg-emergency text-primary-foreground hover:bg-emergency/90"
                        : "bg-primary text-primary-foreground hover:bg-primary/90"
                    }`}
            >
                <Droplet className="h-4 w-4" />
                Request {data.blood_group} Blood
            </a>
        </div>
    );
};

export default NgoCard;
