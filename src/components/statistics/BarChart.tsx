interface BarChartItem {
    label: string;
    visitors: number;
}

interface BarChartProps {
    data: BarChartItem[];
    columnWidth: string;
    translateLabel: (label: string) => string;
}

export default function BarChart({ data, columnWidth, translateLabel }: BarChartProps) {
    const maxVisitors = Math.max(...data.map((d) => d.visitors), 1);

    return (
        <div className='h-64 sm:h-72 overflow-x-auto overflow-y-hidden pb-2'>
            <div className='flex items-end justify-center gap-4 sm:gap-6 px-2 sm:px-4 h-full min-w-max pt-8'>
                {data.map((item, index) => {
                    const height = (item.visitors / maxVisitors) * 100;
                    return (
                        <div key={index} className={`flex flex-col items-center h-full relative group ${columnWidth} flex-shrink-0`}>
                            <div className='w-full flex flex-col items-center justify-end h-full overflow-visible'>
                                {height <= 20 && (
                                    <span className='text-[#005baa] text-xs sm:text-sm font-semibold mb-1 whitespace-nowrap'>
                                        {item.visitors}
                                    </span>
                                )}
                                <div
                                    className='w-full bg-[#005baa] rounded-t-md transition-all hover:bg-[#004a8f] cursor-pointer relative overflow-hidden'
                                    style={{ height: `${height}%`, minHeight: item.visitors > 0 ? '10px' : '0' }}
                                >
                                    {height > 20 && (
                                        <span className='text-white text-xs sm:text-sm font-semibold absolute inset-0 flex items-center justify-center'>
                                            {item.visitors}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className='text-sm sm:text-base text-gray-600 mt-2 text-center font-medium whitespace-nowrap'>
                                {translateLabel(item.label)}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
