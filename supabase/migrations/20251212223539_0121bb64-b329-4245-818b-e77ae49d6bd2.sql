-- Adicionar configuração para controlar visibilidade do link API Sondas
INSERT INTO app_settings (key, value, description)
VALUES ('show_api_sondas_menu', true, 'Controla a visibilidade do link API Sondas no menu principal')
ON CONFLICT (key) DO NOTHING;