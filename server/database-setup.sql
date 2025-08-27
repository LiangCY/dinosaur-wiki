-- 恐龙百科数据库表结构
-- 在 Supabase SQL Editor 中执行此脚本

-- 创建恐龙主表
CREATE TABLE IF NOT EXISTS public.dinosaurs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    scientific_name VARCHAR(255) NOT NULL,
    period VARCHAR(100) NOT NULL,
    diet VARCHAR(50) NOT NULL,
    length_min_meters DECIMAL(10,2),
    length_max_meters DECIMAL(10,2),
    weight_min_tons DECIMAL(10,2),
    weight_max_tons DECIMAL(10,2),
    habitat TEXT,
    region VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);



-- 创建恐龙化石表
CREATE TABLE IF NOT EXISTS public.dinosaur_fossils (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    dinosaur_id UUID NOT NULL REFERENCES public.dinosaurs(id) ON DELETE CASCADE,
    location VARCHAR(255) NOT NULL,
    discovery_date DATE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_dinosaurs_name ON public.dinosaurs(name);
CREATE INDEX IF NOT EXISTS idx_dinosaurs_period ON public.dinosaurs(period);
CREATE INDEX IF NOT EXISTS idx_dinosaurs_diet ON public.dinosaurs(diet);

CREATE INDEX IF NOT EXISTS idx_fossils_dinosaur_id ON public.dinosaur_fossils(dinosaur_id);

-- 启用行级安全性 (RLS)
ALTER TABLE public.dinosaurs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dinosaur_fossils ENABLE ROW LEVEL SECURITY;

-- 创建策略允许所有操作（开发环境）
-- 注意：生产环境中应该设置更严格的策略
CREATE POLICY "Allow all operations on dinosaurs" ON public.dinosaurs
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on dinosaur_fossils" ON public.dinosaur_fossils
    FOR ALL USING (true) WITH CHECK (true);

-- 插入一些示例数据
INSERT INTO public.dinosaurs (name, scientific_name, period, diet, description) VALUES
('霸王龙', 'Tyrannosaurus rex', '白垩纪晚期', '肉食性', '霸王龙是最著名的肉食性恐龙之一，生活在约6800万年前的白垩纪晚期。'),
('三角龙', 'Triceratops', '白垩纪晚期', '植食性', '三角龙是一种大型植食性恐龙，以其头部的三个角和大型颈盾而闻名。'),
('剑龙', 'Stegosaurus', '侏罗纪晚期', '植食性', '剑龙是一种大型植食性恐龙，背部有两排骨板，尾部有四根尖刺。')
ON CONFLICT DO NOTHING;



-- 为示例恐龙添加化石数据
WITH dinosaur_ids AS (
    SELECT id, name FROM public.dinosaurs WHERE name IN ('霸王龙', '三角龙', '剑龙')
)
INSERT INTO public.dinosaur_fossils (dinosaur_id, location, discovery_date, description)
SELECT 
    d.id,
    CASE 
        WHEN d.name = '霸王龙' THEN '美国蒙大拿州'
        WHEN d.name = '三角龙' THEN '美国怀俄明州'
        WHEN d.name = '剑龙' THEN '美国科罗拉多州'
    END,
    CASE 
        WHEN d.name = '霸王龙' THEN '1990-08-12'::DATE
        WHEN d.name = '三角龙' THEN '1887-03-15'::DATE
        WHEN d.name = '剑龙' THEN '1877-07-01'::DATE
    END,
    CASE 
        WHEN d.name = '霸王龙' THEN '发现了几乎完整的骨架化石'
        WHEN d.name = '三角龙' THEN '发现了头骨和部分骨架'
        WHEN d.name = '剑龙' THEN '发现了背板和尾刺化石'
    END
FROM dinosaur_ids d
ON CONFLICT DO NOTHING;

COMMIT;