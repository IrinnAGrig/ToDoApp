export interface Activity {
    id: string;
    idUser: string;
    description: string;
    title: string;
    date: number;
    month: number;
    year: number;
    timeForCompletion: number;
    priority: 'High' | 'Medium' | 'Low';
    isActive: boolean;
    isCompleted: boolean;
    dateCreated: string;
    timeToBeDeleted: string;
}

export interface FiltersActivity {
    date: string;
    month: string;
    isActive: boolean;
    isCompleted: 'false' | 'true' | 'any';
}

export interface HistoryActivities {
    idUser: string;
    activities: Activity[];
}
