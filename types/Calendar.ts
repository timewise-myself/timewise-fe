export interface Schedule {
    id: number;
    title: string;
    start_time: string;
    end_time: string;
    location: string;
    all_day: boolean;
    workspace_id: number;
}